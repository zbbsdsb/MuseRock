# Statuz Integration in MuseRock

## Overview

MuseRock uses Statuz (the AI Agent Runtime Status Protocol) to manage and preserve creative session state. This document explains how Statuz is integrated and how to use it.

## What is Statuz?

Statuz is a protocol for managing AI agent runtime status. It helps agents remember:

- **Who they are** (identity)
- **What they're doing** (current state)
- **Where they left off** (checkpoints)
- **What to do next** (next action)

## Statuz Files in MuseRock

### 1. Core Configuration
`.statuz/statuz.yaml` - Main status file for the current creative session

### 2. SDK (TypeScript)
`packages/statuz-sdk-ts/` - TypeScript SDK for reading and writing Statuz files

### 3. MCP Server
`packages/statuz-mcp-server/` - Model Context Protocol server for AI assistant integration

## Creative Loop Integration

Statuz naturally maps to MuseRock's Creative Loop stages:

| Statuz Stage | Creative Loop Stage |
|--------------|---------------------|
| `prime`      | Prime (Inspiration) |
| `drafting`   | Cloister (Creation) |
| `divergence` | Divergence (Exploration) |
| `reflection` | Reflection (Review) |

## Quick Start Guide

### Initialize Statuz (if not exists)

1. The SDK can initialize Statuz automatically
2. Or you can copy the example:
   ```bash
   cp .statuz/statuz.yaml.example .statuz/statuz.yaml
   ```

### Basic Usage with the SDK

```typescript
import { Statuz } from '@muserock/statuz-sdk';

// Read current status
const statuz = Statuz.read('.statuz/statuz.yaml');

// Get current state
const { current_state, identity } = statuz.getDocument();

// Update current task and status
statuz.currentState.task = "Write chapter 3";
statuz.currentState.status = "in_progress";
statuz.currentState.stage = "prime";

// Add a checkpoint
statuz.appendCheckpoint(
  "Started working on chapter 3 opening",
  "Continue writing the first draft"
);

// Save changes
statuz.write('.statuz/statuz.yaml');
```

### Get a Resume Brief

```typescript
import { Statuz } from '@muserock/statuz-sdk';

const statuz = Statuz.read('.statuz/statuz.yaml');
const doc = statuz.getDocument();

// Generate a human-readable resume
console.log(`=== Resume Summary ===`);
console.log(`Project: ${doc.identity.project_name}`);
console.log(`Status: ${doc.current_state.status}`);
console.log(`Stage: ${doc.current_state.stage}`);
console.log(`Last checkpoint: ${doc.current_state.last_checkpoint}`);
console.log(`Next: ${doc.current_state.next_action}`);
```

## Integration with MuseRock Components

### 1. Creative Loop Store

Add Statuz to your creative loop store:

```typescript
import { Statuz } from '@muserock/statuz-sdk';

interface CreativeLoopStore {
  currentStage: 'prime' | 'cloister' | 'divergence' | 'reflection';
  statuz: Statuz | null;
  loadStatuz: () => void;
  saveCheckpoint: (summary: string) => void;
}
```

### 2. Resume When Returning

When the user returns, show them a resume:

```tsx
// In your main App component
useEffect(() => {
  try {
    const statuz = Statuz.read('.statuz/statuz.yaml');
    const doc = statuz.getDocument();
    
    // Show resume modal
    if (doc.current_state.last_checkpoint) {
      showResumeModal({
        lastCheckpoint: doc.current_state.last_checkpoint,
        nextAction: doc.current_state.next_action,
        task: doc.current_state.task
      });
    }
  } catch {
    // No existing statuz, that's okay
  }
}, []);
```

## MCP Server Setup

The MCP server lets your AI assistant access Statuz:

### Install and Build

```bash
cd packages/statuz-mcp-server
npm install
npm run build
```

### Configure Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "muserock-statuz": {
      "command": "node",
      "args": [
        "absolute/path/to/MuseRock/packages/statuz-mcp-server/dist/index.js"
      ]
    }
  }
}
```

### Available Tools

- `statuz_init` - Create a new Statuz file
- `statuz_read` - Read current status
- `statuz_update_status` - Update current state
- `statuz_checkpoint` - Add a checkpoint
- `statuz_get_resume_brief` - Get a summary for resuming work

## Best Practices

### 1. Keep Checkpoints Meaningful

Don't log every tiny edit. Focus on:

- ✅ "Completed first draft of Act 1"
- ✅ "Research complete for historical background"
- ✅ "Switched to Cloister mode for focused writing"

### 2. Map to Creative Loop Stages

Always keep `current_state.stage` in sync with your UI:

- `"prime"` - Inspiration and research phase
- `"drafting"` (Cloister) - Writing and creation
- `"divergence"` - Exploration and ideation
- `"reflection"` - Review and editing

### 3. Don't Store Secrets

Statuz is for status, not secrets. Keep API keys in MuseRock's secure config, not in Statuz.

### 4. Keep it Lightweight

Avoid putting entire project content in Statuz. Use references to files instead.

## Example Workflow

1. **User starts MuseRock** → `statuz_init` (if needed)
2. **User enters Prime mode** → `statuz_update_status` stage="prime"
3. **User finds inspiration** → `statuz_checkpoint` summary="Found great inspiration from..."
4. **User switches to Cloister** → `statuz_update_status` stage="drafting"
5. **User takes a break** → `statuz_checkpoint` + status="idle"
6. **User returns** → `statuz_get_resume_brief` → Show resume UI

## Files Created/Modified

| File | Purpose |
|------|---------|
| `.statuz/statuz.yaml` | Main status file |
| `packages/statuz-sdk-ts/` | TypeScript SDK |
| `packages/statuz-mcp-server/` | MCP server |
| `spec/statuz/statuz.schema.json` | JSON Schema |
| `docs/STATUZ_INTEGRATION.md` | This file |

## Troubleshooting

### File not found

Make sure `.statuz/` exists and is readable.

### Schema validation errors

Check `spec/statuz/statuz.schema.json` for the valid format.

## Future Enhancements

- [ ] Auto-save checkpoints at stage transitions
- [ ] Visual status bar showing current Statuz state
- [ ] Cloud sync for Statuz files (optional)
- [ ] Integration with MuseRock's 5-layer memory system

## License

Apache-2.0, same as the rest of MuseRock.
