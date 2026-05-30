import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import YAML from "yaml";
import AjvImport from "ajv";
import addFormatsImport from "ajv-formats";
const Ajv = AjvImport;
const addFormats = addFormatsImport;
export class Statuz {
    data;
    constructor(data) {
        this.data = data;
    }
    static read(filePath) {
        const fullPath = resolve(process.cwd(), filePath);
        if (!existsSync(fullPath)) {
            throw new Error(`File not found: ${fullPath}`);
        }
        try {
            const raw = readFileSync(fullPath, "utf8");
            const data = YAML.parse(raw);
            return new Statuz(data);
        }
        catch (err) {
            if (err instanceof YAML.YAMLError) {
                throw new Error(`Invalid YAML in file: ${fullPath}\n  ${err.message}`);
            }
            throw new Error(`Could not read file: ${fullPath}`);
        }
    }
    static validate(filePath) {
        const fullPath = resolve(process.cwd(), filePath);
        if (!existsSync(fullPath)) {
            return {
                valid: false,
                errors: [{ path: "(root)", message: `File not found: ${fullPath}` }]
            };
        }
        try {
            const raw = readFileSync(fullPath, "utf8");
            const doc = YAML.parse(raw);
            return Statuz.validateDocument(doc);
        }
        catch (err) {
            if (err instanceof YAML.YAMLError) {
                return {
                    valid: false,
                    errors: [{ path: "(root)", message: `Invalid YAML: ${err.message}` }]
                };
            }
            return {
                valid: false,
                errors: [{ path: "(root)", message: `Could not read file: ${fullPath}` }]
            };
        }
    }
    static validateDocument(doc) {
        const schema = Statuz.loadSchema();
        const ajv = new Ajv({ allErrors: true, strict: false });
        addFormats(ajv);
        const validate = ajv.compile(schema);
        const valid = validate(doc);
        if (valid) {
            return { valid: true };
        }
        return {
            valid: false,
            errors: (validate.errors || []).map((err) => ({
                path: err.instancePath || "(root)",
                message: err.message || "Unknown validation error"
            }))
        };
    }
    static create(agentName, projectName) {
        const data = {
            statuz_version: "0.1",
            updated_at: new Date().toISOString(),
            identity: {
                agent_name: agentName,
                project_name: projectName,
                environment: "local-dev"
            },
            current_state: {
                stage: "initialization",
                task: "initialize Statuz",
                status: "idle",
                last_checkpoint: "Statuz file created",
                next_action: "define the agent's current goal"
            },
            progress: {
                completed: ["created initial Statuz file"],
                blocked_by: [],
                open_questions: []
            },
            relations: {
                related_agents: [],
                related_projects: [],
                related_files: [],
                related_tools: []
            },
            rules: {
                should: ["read Statuz at session start", "write checkpoint after meaningful progress"],
                should_not: ["store API keys, tokens, passwords, or secrets"]
            },
            checkpoints: [{
                    id: "cp-001",
                    at: new Date().toISOString(),
                    summary: "Initialized Statuz.",
                    next_action: "Define current task and next action."
                }]
        };
        return new Statuz(data);
    }
    static forAgent(agentName, projectName) {
        const defaultPath = `.statuz/agents/${agentName}.yaml`;
        if (existsSync(resolve(process.cwd(), defaultPath))) {
            return Statuz.read(defaultPath);
        }
        const statuz = Statuz.create(agentName, projectName);
        statuz.write(defaultPath);
        return statuz;
    }
    write(filePath) {
        const fullPath = resolve(process.cwd(), filePath);
        const outDir = dirname(fullPath);
        try {
            mkdirSync(outDir, { recursive: true });
        }
        catch {
            throw new Error(`Could not create directory: ${outDir}`);
        }
        this.data.updated_at = new Date().toISOString();
        try {
            writeFileSync(fullPath, YAML.stringify(this.data), "utf8");
        }
        catch {
            throw new Error(`Could not write file: ${fullPath}`);
        }
    }
    validate() {
        return Statuz.validateDocument(this.data);
    }
    appendCheckpoint(summary, nextAction) {
        const checkpoints = this.data.checkpoints || [];
        const nextId = `cp-${String(checkpoints.length + 1).padStart(3, "0")}`;
        const checkpoint = {
            id: nextId,
            at: new Date().toISOString(),
            summary,
            next_action: nextAction
        };
        if (!this.data.checkpoints) {
            this.data.checkpoints = [];
        }
        this.data.checkpoints.push(checkpoint);
        return checkpoint;
    }
    getDocument() {
        return { ...this.data };
    }
    get identity() {
        return this.data.identity;
    }
    get currentState() {
        return this.data.current_state;
    }
    get checkpoints() {
        return this.data.checkpoints || [];
    }
    set currentState(state) {
        this.data.current_state = state;
    }
    static loadSchema() {
        const candidates = [
            resolve(process.cwd(), "spec/statuz/statuz.schema.json"),
            resolve(dirname(import.meta.dirname), "../../spec/statuz/statuz.schema.json"),
            resolve(dirname(import.meta.dirname), "../../../spec/statuz/statuz.schema.json")
        ];
        for (const candidate of candidates) {
            if (existsSync(candidate)) {
                try {
                    return JSON.parse(readFileSync(candidate, "utf8"));
                }
                catch {
                    continue;
                }
            }
        }
        throw new Error("Could not find statuz.schema.json. Try running from the project root.");
    }
}
//# sourceMappingURL=statuz.js.map