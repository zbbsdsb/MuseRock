import { Injectable } from '@nestjs/common';

export interface PromptTemplate {
  id: string;
  name: string;
  role: string;
  template: string;
  schema?: Record<string, any>;
  variables: string[];
  version: string;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}

export interface PromptRenderOptions {
  variables: Record<string, string>;
  context?: Record<string, any>;
}

@Injectable()
export class PromptRegistryService {
  private prompts: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.initializeDefaultPrompts();
  }

  private initializeDefaultPrompts(): void {
    const defaultPrompts: PromptTemplate[] = [
      {
        id: 'researcher-v1',
        name: 'Researcher',
        role: 'researcher',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Expert research assistant for exploring topics',
        variables: ['topic', 'depth'],
        template: `You are MuseRock's Researcher. Your responsibilities are:
1. Explore the topic: {{topic}} broadly first, then narrow down
2. Identify high-value inspiration directions
3. Formulate key research questions
4. Suggest credible source types
5. Distinguish between facts, assumptions, and unverified clues
6. Provide research at {{depth}} level of detail

Output format (JSON):
{
  "research_questions": ["question1", "question2", ...],
  "key_findings": [{"title": "...", "content": "...", "source_type": "..."}, ...],
  "inspiration_directions": ["direction1", "direction2", ...],
  "open_questions": ["question1", "question2", ...]
}`,
        schema: {
          type: 'object',
          properties: {
            research_questions: { type: 'array', items: { type: 'string' } },
            key_findings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                  source_type: { type: 'string' },
                },
              },
            },
            inspiration_directions: { type: 'array', items: { type: 'string' } },
            open_questions: { type: 'array', items: { type: 'string' } },
          },
          required: ['research_questions', 'key_findings'],
        },
      },
      {
        id: 'writer-v1',
        name: 'Writer',
        role: 'writer',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Professional content writer',
        variables: ['tone', 'length', 'format'],
        template: `You are MuseRock's Writer. Your responsibilities are:
1. Transform briefs, research packages, and feedback into readable drafts
2. Maintain consistent voice with {{tone}} tone
3. Target {{length}} word count
4. Output in {{format}} format
5. Cite sources properly when using research references
6. Include summary, body, and key points

Output format (JSON):
{
  "summary": "...",
  "sections": [{"title": "...", "content": "..."}, ...],
  "key_points": ["point1", "point2", ...],
  "word_count": number,
  "sources": ["source1", "source2", ...]
}`,
        schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                },
              },
            },
            key_points: { type: 'array', items: { type: 'string' } },
            word_count: { type: 'number' },
            sources: { type: 'array', items: { type: 'string' } },
          },
          required: ['summary', 'sections'],
        },
      },
      {
        id: 'designer-v1',
        name: 'Designer',
        role: 'designer',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Creative design concept generator',
        variables: ['theme', 'style', 'medium'],
        template: `You are MuseRock's Designer. Your responsibilities are:
1. Convert textual themes into visual directions
2. Theme: {{theme}}
3. Style: {{style}}
4. Medium: {{medium}}
5. Provide color palettes, typography, and layout principles
6. Distinguish between visual concepts, design tokens, and risks
7. Never overwrite Writer's narrative intent

Output format (JSON):
{
  "concept": "...",
  "color_palette": {"primary": "...", "secondary": "...", "accent": "...", "neutral": "..."},
  "typography": {"heading": "...", "body": "...", "accent": "..."},
  "layout_principles": ["principle1", "principle2", ...],
  "design_tokens": {"spacing": "...", "radius": "...", "shadow": "..."},
  "risks": ["risk1", "risk2", ...]
}`,
        schema: {
          type: 'object',
          properties: {
            concept: { type: 'string' },
            color_palette: {
              type: 'object',
              properties: {
                primary: { type: 'string' },
                secondary: { type: 'string' },
                accent: { type: 'string' },
                neutral: { type: 'string' },
              },
            },
            typography: {
              type: 'object',
              properties: {
                heading: { type: 'string' },
                body: { type: 'string' },
                accent: { type: 'string' },
              },
            },
            layout_principles: { type: 'array', items: { type: 'string' } },
            design_tokens: { type: 'object' },
            risks: { type: 'array', items: { type: 'string' } },
          },
          required: ['concept', 'color_palette'],
        },
      },
      {
        id: 'musician-v1',
        name: 'Musician',
        role: 'musician',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Music concept and composition assistant',
        variables: ['mood', 'genre', 'duration'],
        template: `You are MuseRock's Musician. Your responsibilities are:
1. Convert emotional beats and structure into musical concepts
2. Mood: {{mood}}
3. Genre: {{genre}}
4. Duration: {{duration}}
5. Provide mood arcs, tempo ranges, and instrumentation suggestions
6. Create cue sheets for different sections
7. Ensure musical direction aligns with visual and narrative goals

Output format (JSON):
{
  "concept": "...",
  "mood_arc": {"intro": "...", "build": "...", "climax": "...", "resolution": "..."},
  "tempo_range": {"min": number, "max": number, "unit": "BPM"},
  "instrumentation": ["instrument1", "instrument2", ...],
  "sections": [{"name": "...", "duration": "...", "description": "..."}, ...],
  "key_signature": "...",
  "dynamics": ["dynamic1", "dynamic2", ...]
}`,
        schema: {
          type: 'object',
          properties: {
            concept: { type: 'string' },
            mood_arc: {
              type: 'object',
              properties: {
                intro: { type: 'string' },
                build: { type: 'string' },
                climax: { type: 'string' },
                resolution: { type: 'string' },
              },
            },
            tempo_range: {
              type: 'object',
              properties: {
                min: { type: 'number' },
                max: { type: 'number' },
                unit: { type: 'string' },
              },
            },
            instrumentation: { type: 'array', items: { type: 'string' } },
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  duration: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
            key_signature: { type: 'string' },
            dynamics: { type: 'array', items: { type: 'string' } },
          },
          required: ['concept', 'mood_arc'],
        },
      },
    ];

    for (const prompt of defaultPrompts) {
      this.prompts.set(prompt.id, prompt);
    }
  }

  getAllPrompts(): PromptTemplate[] {
    return Array.from(this.prompts.values());
  }

  getPromptById(id: string): PromptTemplate | undefined {
    return this.prompts.get(id);
  }

  getPromptsByRole(role: string): PromptTemplate[] {
    return Array.from(this.prompts.values()).filter((p) => p.role === role);
  }

  createPrompt(prompt: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'>): PromptTemplate {
    const newPrompt: PromptTemplate = {
      ...prompt,
      version: '1.0.0',
      id: `${prompt.role}-${Date.now().toString(36)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.prompts.set(newPrompt.id, newPrompt);
    return newPrompt;
  }

  updatePrompt(id: string, updates: Partial<PromptTemplate>): PromptTemplate | undefined {
    const existing = this.prompts.get(id);
    if (!existing) return undefined;

    const updated: PromptTemplate = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.prompts.set(id, updated);
    return updated;
  }

  deletePrompt(id: string): boolean {
    return this.prompts.delete(id);
  }

  renderPrompt(id: string, options: PromptRenderOptions): string {
    const prompt = this.prompts.get(id);
    if (!prompt) {
      throw new Error(`Prompt template not found: ${id}`);
    }

    let rendered = prompt.template;
    
    for (const [key, value] of Object.entries(options.variables)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    if (options.context) {
      const contextStr = Object.entries(options.context)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join('\n');
      rendered += `\n\nAdditional context:\n${contextStr}`;
    }

    return rendered;
  }

  validateVariables(id: string, variables: Record<string, string>): string[] {
    const prompt = this.prompts.get(id);
    if (!prompt) {
      throw new Error(`Prompt template not found: ${id}`);
    }

    const missing: string[] = [];
    for (const variable of prompt.variables) {
      if (!variables[variable]) {
        missing.push(variable);
      }
    }
    return missing;
  }

  getSchema(id: string): Record<string, any> | undefined {
    const prompt = this.prompts.get(id);
    return prompt?.schema;
  }
}
