import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { Statuz } from "../../statuz-sdk-ts/src/index.js";
import { existsSync } from "node:fs";
import { resolve, relative, sep } from "node:path";

const DEFAULT_STATUZ_PATH = ".statuz/statuz.yaml";

const SENSITIVE_PATHS = [
  ".git",
  "node_modules",
  ".statuz/private",
  ".env",
  ".env.local",
  ".env.development",
  ".env.production"
];

let allowedRoots: string[] = [process.cwd()];

export function setAllowedRoots(roots: string[]) {
  allowedRoots = roots.map(root => resolve(root));
}

function assertSafePath(filePath: string): string {
  const resolvedPath = resolve(filePath);
  
  for (const root of allowedRoots) {
    const rel = relative(root, resolvedPath);
    if (!rel.startsWith("..") && !rel.startsWith("." + sep)) {
      for (const sensitive of SENSITIVE_PATHS) {
        if (resolvedPath.includes(resolve(root, sensitive))) {
          throw new Error(`Access to sensitive path is restricted: ${filePath}`);
        }
      }
      return resolvedPath;
    }
  }
  
  throw new Error(`Path is outside allowed roots: ${filePath}`);
}

export interface ToolContext {
  statuzPath?: string;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export const statuzTools: Tool[] = [
  {
    name: "statuz_validate",
    description: "Validate a Statuz YAML file against the schema",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the Statuz YAML file",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "statuz_read",
    description: "Read and parse a Statuz YAML file",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the Statuz YAML file (defaults to .statuz/statuz.yaml)",
        },
      },
    },
  },
  {
    name: "statuz_resume",
    description: "Get a human-readable summary of a Statuz file",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the Statuz YAML file",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "statuz_update",
    description: "Update a field in a Statuz file",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the Statuz YAML file",
        },
        field: {
          type: "string",
          description: "Dot-notation path to the field to update (e.g., 'current_state.status')",
        },
        value: {
          description: "New value for the field",
        },
      },
      required: ["path", "field", "value"],
    },
  },
  {
    name: "statuz_checkpoint",
    description: "Add a checkpoint to a Statuz file to record progress",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the Statuz YAML file (defaults to .statuz/statuz.yaml)",
        },
        summary: {
          type: "string",
          description: "Checkpoint summary describing recent progress",
        },
        nextAction: {
          type: "string",
          description: "Next action to take after this checkpoint",
        },
      },
      required: ["summary"],
    },
  },
  {
    name: "statuz_get_resume_brief",
    description: "Get a human-readable summary of current agent status (core resume use case)",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the Statuz YAML file (defaults to .statuz/statuz.yaml)",
        },
      },
    },
  },
  {
    name: "statuz_update_status",
    description: "Update one or more fields in the current_state section",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the Statuz YAML file",
        },
        status: {
          type: "string",
          description: "New status value (e.g., idle, in_progress, blocked, waiting_for_user, completed)",
        },
        stage: {
          type: "string",
          description: "New stage value (e.g., planning, implementation, testing, review)",
        },
        task: {
          type: "string",
          description: "Current task description",
        },
        nextAction: {
          type: "string",
          description: "Next action to take",
        },
        lastCheckpoint: {
          type: "string",
          description: "Description of the last checkpoint",
        },
      },
    },
  },
  {
    name: "statuz_init",
    description: "Initialize a new Statuz file",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path for the new Statuz file (defaults to .statuz/statuz.yaml)",
        },
        agentName: {
          type: "string",
          description: "Name of the agent",
        },
        projectName: {
          type: "string",
          description: "Name of the project",
        },
      },
    },
  },
];

export function getTools() {
  return {
    statuz_validate: async (args: { path: string }): Promise<ToolResult> => {
      try {
        const safePath = assertSafePath(args.path);
        const result = Statuz.validate(safePath);
        return {
          success: result.valid,
          data: {
            valid: result.valid,
            errors: result.errors,
            path: args.path,
          },
        };
      } catch (err) {
        if (err instanceof Error) {
          return {
            success: false,
            error: `Validation failed: ${err.message}`,
          };
        }
        return {
          success: false,
          error: "Validation failed with an unknown error",
        };
      }
    },
    statuz_read: async (args: { filePath?: string }): Promise<ToolResult> => {
      const filePath = args.filePath || DEFAULT_STATUZ_PATH;
      try {
        const safePath = assertSafePath(filePath);
        const statuz = Statuz.read(safePath);
        return {
          success: true,
          data: statuz.getDocument(),
        };
      } catch (err) {
        if (err instanceof Error) {
          return {
            success: false,
            error: `Failed to read Statuz file: ${err.message}`,
          };
        }
        return {
          success: false,
          error: `Failed to read Statuz file: ${filePath}`,
        };
      }
    },
    statuz_resume: async (args: { path: string }): Promise<ToolResult> => {
      try {
        const safePath = assertSafePath(args.path);
        const statuz = Statuz.read(safePath);
        const doc = statuz.getDocument();
        const state = doc.current_state;
        const identity = doc.identity;

        const lines: string[] = [
          "=== Statuz Resume ===",
          `Agent:    ${identity.agent_name}`,
          `Project:  ${identity.project_name}`,
        ];

        if (identity.organization) {
          lines.push(`Org:      ${identity.organization}`);
        }
        if (identity.environment) {
          lines.push(`Env:      ${identity.environment}`);
        }

        lines.push("");
        lines.push(`Status:   ${state.status}`);

        if (state.stage) {
          lines.push(`Stage:    ${state.stage}`);
        }
        if (state.task) {
          lines.push(`Task:     ${state.task}`);
        }
        if (state.last_checkpoint) {
          lines.push(`Last CP:  ${state.last_checkpoint}`);
        }
        if (state.next_action) {
          lines.push(`Next:     ${state.next_action}`);
        }

        return {
          success: true,
          data: {
            brief: lines.join("\n"),
            summary: {
              agentName: identity.agent_name,
              projectName: identity.project_name,
              status: state.status,
              stage: state.stage,
              task: state.task,
              lastCheckpoint: state.last_checkpoint,
              nextAction: state.next_action,
            },
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: message,
        };
      }
    },
    statuz_update: async (args: { path: string; field: string; value: unknown }): Promise<ToolResult> => {
      try {
        const safePath = assertSafePath(args.path);
        const statuz = Statuz.read(safePath);
        const doc = statuz.getDocument();
        
        const fieldParts = args.field.split(".");
        let current: any = doc;
        
        for (let i = 0; i < fieldParts.length - 1; i++) {
          if (!(fieldParts[i] in current)) {
            current[fieldParts[i]] = {};
          }
          current = current[fieldParts[i]];
        }
        
        current[fieldParts[fieldParts.length - 1]] = args.value;
        
        statuz.write(safePath);
        
        return {
          success: true,
          data: {
            message: `Updated ${args.field} in ${args.path}`,
            field: args.field,
            value: args.value,
            newDocument: statuz.getDocument(),
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: message,
        };
      }
    },
    statuz_checkpoint: async (args: { filePath?: string; summary: string; nextAction?: string }): Promise<ToolResult> => {
      const filePath = args.filePath || DEFAULT_STATUZ_PATH;
      try {
        const safePath = assertSafePath(filePath);
        const statuz = Statuz.read(safePath);
        const checkpoint = statuz.appendCheckpoint(args.summary, args.nextAction);
        statuz.write(safePath);
        return {
          success: true,
          data: {
            message: `Checkpoint ${checkpoint.id} added successfully`,
            checkpoint,
          },
        };
      } catch (err) {
        if (err instanceof Error) {
          return {
            success: false,
            error: `Failed to write checkpoint: ${err.message}`,
          };
        }
        return {
          success: false,
          error: `Failed to write checkpoint to: ${filePath}`,
        };
      }
    },
    statuz_get_resume_brief: async (args: { filePath?: string }): Promise<ToolResult> => {
      try {
        const path = args.filePath || DEFAULT_STATUZ_PATH;
        const safePath = assertSafePath(path);
        const statuz = Statuz.read(safePath);
        const doc = statuz.getDocument();
        const state = doc.current_state;
        const identity = doc.identity;

        const lines: string[] = [
          "=== Statuz Resume ===",
          `Agent:    ${identity.agent_name}`,
          `Project:  ${identity.project_name}`,
        ];

        if (identity.organization) {
          lines.push(`Org:      ${identity.organization}`);
        }
        if (identity.environment) {
          lines.push(`Env:      ${identity.environment}`);
        }

        lines.push("");
        lines.push(`Status:   ${state.status}`);

        if (state.stage) {
          lines.push(`Stage:    ${state.stage}`);
        }
        if (state.task) {
          lines.push(`Task:     ${state.task}`);
        }
        if (state.last_checkpoint) {
          lines.push(`Last CP:  ${state.last_checkpoint}`);
        }
        if (state.next_action) {
          lines.push(`Next:     ${state.next_action}`);
        }

        return {
          success: true,
          data: {
            brief: lines.join("\n"),
            summary: {
              agentName: identity.agent_name,
              projectName: identity.project_name,
              status: state.status,
              stage: state.stage,
              task: state.task,
              lastCheckpoint: state.last_checkpoint,
              nextAction: state.next_action,
            },
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: message,
        };
      }
    },
    statuz_update_status: async (args: { 
      filePath?: string; 
      status?: string; 
      stage?: string; 
      task?: string; 
      nextAction?: string; 
      lastCheckpoint?: string 
    }): Promise<ToolResult> => {
      try {
        const path = args.filePath || DEFAULT_STATUZ_PATH;
        const safePath = assertSafePath(path);
        const statuz = Statuz.read(safePath);
        const currentState = statuz.currentState;

        if (args.status !== undefined) {
          currentState.status = args.status;
        }
        if (args.stage !== undefined) {
          currentState.stage = args.stage;
        }
        if (args.task !== undefined) {
          currentState.task = args.task;
        }
        if (args.nextAction !== undefined) {
          currentState.next_action = args.nextAction;
        }
        if (args.lastCheckpoint !== undefined) {
          currentState.last_checkpoint = args.lastCheckpoint;
        }

        statuz.currentState = currentState;
        statuz.write(safePath);

        return {
          success: true,
          data: {
            message: `Updated ${path}`,
            updatedFields: {
              ...(args.status !== undefined && { status: args.status }),
              ...(args.stage !== undefined && { stage: args.stage }),
              ...(args.task !== undefined && { task: args.task }),
              ...(args.nextAction !== undefined && { nextAction: args.nextAction }),
              ...(args.lastCheckpoint !== undefined && { lastCheckpoint: args.lastCheckpoint }),
            },
            newState: statuz.currentState,
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: message,
        };
      }
    },
    statuz_init: async (args: { filePath?: string; agentName?: string; projectName?: string }): Promise<ToolResult> => {
      try {
        const path = args.filePath || DEFAULT_STATUZ_PATH;
        const safePath = assertSafePath(path);

        if (existsSync(safePath)) {
          return {
            success: false,
            error: `File already exists: ${path}`,
          };
        }

        const agentName = args.agentName || "dev-agent";
        const projectName = args.projectName || "example-project";
        const statuz = Statuz.create(agentName, projectName);
        statuz.write(safePath);

        return {
          success: true,
          data: {
            message: `Created ${path}`,
            agentName,
            projectName,
            document: statuz.getDocument(),
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: message,
        };
      }
    },
  };
}
