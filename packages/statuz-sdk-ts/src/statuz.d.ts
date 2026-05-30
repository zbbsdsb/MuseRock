import type { StatuzDocument, ValidationResult, Checkpoint } from "./types.js";
export declare class Statuz {
    private data;
    private constructor();
    static read(filePath: string): Statuz;
    static validate(filePath: string): ValidationResult;
    static validateDocument(doc: unknown): ValidationResult;
    static create(agentName: string, projectName: string): Statuz;
    static forAgent(agentName: string, projectName: string): Statuz;
    write(filePath: string): void;
    validate(): ValidationResult;
    appendCheckpoint(summary: string, nextAction?: string): Checkpoint;
    getDocument(): StatuzDocument;
    get identity(): import("./types.js").Identity;
    get currentState(): StatuzDocument["current_state"];
    get checkpoints(): Checkpoint[];
    set currentState(state: StatuzDocument["current_state"]);
    private static loadSchema;
}
