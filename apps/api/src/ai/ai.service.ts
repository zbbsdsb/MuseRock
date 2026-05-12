import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { GoogleGenAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import { ApiProvider } from '../api-keys/entities/api-key.entity';

export interface GenerationRequest {
  prompt: string;
  role?: string;
  provider?: ApiProvider;
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    responseFormat?: 'json' | 'text';
  };
  templateId?: string;
  variables?: Record<string, string>;
}

export interface PromptTemplate {
  id: string;
  name: string;
  role: string;
  template: string;
  variables: string[];
  description?: string;
  schema?: Record<string, any>;
  category?: string;
}

@Injectable()
export class AIService {
  private promptTemplates: PromptTemplate[] = [
    {
      id: 'creative-brief',
      name: 'Creative Brief',
      role: 'designer',
      template: 'Create a detailed creative brief for: {{topic}}\n\nTarget audience: {{audience}}\nKey message: {{message}}',
      variables: ['topic', 'audience', 'message'],
      description: 'Generate professional creative briefs',
      category: 'writing',
    },
    {
      id: 'story-outline',
      name: 'Story Outline',
      role: 'writer',
      template: 'Create a story outline for: {{title}}\n\nGenre: {{genre}}\nTheme: {{theme}}',
      variables: ['title', 'genre', 'theme'],
      description: 'Generate story structures',
      category: 'writing',
    },
    {
      id: 'research-summary',
      name: 'Research Summary',
      role: 'researcher',
      template: 'Summarize the following research: {{content}}\n\nKey findings:',
      variables: ['content'],
      description: 'Summarize research materials',
      category: 'research',
    },
    {
      id: 'lyrics',
      name: 'Song Lyrics',
      role: 'musician',
      template: 'Write lyrics for a {{genre}} song about {{topic}}\n\nVerse 1:\nChorus:',
      variables: ['genre', 'topic'],
      description: 'Generate song lyrics',
      category: 'music',
    },
  ];

  async generateContent(request: GenerationRequest): Promise<{ content: string; tokensUsed: { prompt: number; completion: number; total: number } }> {
    const { prompt, provider = 'openai', options = {} } = request;
    
    const apiKey = this.getApiKey(provider);
    const systemPrompt = this.getSystemPrompt(request.role);

    switch (provider) {
      case 'gemini':
        return this.generateWithGemini(apiKey, prompt, systemPrompt, options);
      case 'openai':
        return this.generateWithOpenAI(apiKey, prompt, systemPrompt, options);
      case 'anthropic':
        return this.generateWithAnthropic(apiKey, prompt, systemPrompt, options);
      default:
        throw new HttpException(`Unsupported provider: ${provider}`, HttpStatus.BAD_REQUEST);
    }
  }

  async generateStructuredContent(request: Omit<GenerationRequest, 'templateId' | 'variables'>): Promise<{ content: string; tokensUsed: { prompt: number; completion: number; total: number } }> {
    const { prompt, provider = 'openai', options = {} } = request;
    const apiKey = this.getApiKey(provider);
    const systemPrompt = this.getSystemPrompt(request.role) + '\n\nRespond in JSON format.';

    const mergedOptions = {
      ...options,
      responseFormat: 'json' as const,
    };

    switch (provider) {
      case 'gemini':
        return this.generateWithGemini(apiKey, prompt, systemPrompt, mergedOptions);
      case 'openai':
        return this.generateWithOpenAI(apiKey, prompt, systemPrompt, mergedOptions);
      case 'anthropic':
        return this.generateWithAnthropic(apiKey, prompt, systemPrompt, mergedOptions);
      default:
        throw new HttpException(`Unsupported provider: ${provider}`, HttpStatus.BAD_REQUEST);
    }
  }

  async generateFromTemplate(request: {
    templateId: string;
    variables: Record<string, string>;
    userInput: string;
    provider?: ApiProvider;
    options?: GenerationRequest['options'];
  }): Promise<{ content: string; tokensUsed: { prompt: number; completion: number; total: number } }> {
    const template = this.promptTemplates.find(t => t.id === request.templateId);
    if (!template) {
      throw new HttpException(`Template not found: ${request.templateId}`, HttpStatus.NOT_FOUND);
    }

    let prompt = template.template;
    for (const [key, value] of Object.entries(request.variables)) {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    prompt += `\n\nUser input: ${request.userInput}`;

    const { provider = 'openai', options = {} } = request;
    const apiKey = this.getApiKey(provider);
    const systemPrompt = this.getSystemPrompt(template.role);

    switch (provider) {
      case 'gemini':
        return this.generateWithGemini(apiKey, prompt, systemPrompt, options);
      case 'openai':
        return this.generateWithOpenAI(apiKey, prompt, systemPrompt, options);
      case 'anthropic':
        return this.generateWithAnthropic(apiKey, prompt, systemPrompt, options);
      default:
        throw new HttpException(`Unsupported provider: ${provider}`, HttpStatus.BAD_REQUEST);
    }
  }

  getAvailableProviders(): ApiProvider[] {
    return ['openai', 'gemini', 'anthropic'];
  }

  getPromptTemplates(): PromptTemplate[] {
    return this.promptTemplates;
  }

  getPromptTemplateById(id: string): PromptTemplate | undefined {
    return this.promptTemplates.find(t => t.id === id);
  }

  createPromptTemplate(template: Omit<PromptTemplate, 'id'>): PromptTemplate {
    const newTemplate: PromptTemplate = {
      ...template,
      id: `template-${Date.now()}`,
    };
    this.promptTemplates.push(newTemplate);
    return newTemplate;
  }

  async getInspiration(
    provider: ApiProvider,
    apiKey: string,
    context: string,
    type: string,
  ): Promise<string> {
    const prompt = `Context: ${context}\n\nTask: Provide creation assistance for a creator based on this context. Focus on ${type}. Keep it brief, evocative, and high-impact. Avoid clichés.`;
    const systemPrompt = 'You are MuseRock, an elite creation assistant. You provide sharp, non-obvious insights and materials for creators across various disciplines.';
    
    const result = await this.generateContent({
      prompt,
      provider,
      options: { temperature: 0.8 },
    });
    
    return result.content;
  }

  async sourceAssets(
    provider: ApiProvider,
    apiKey: string,
    query: string,
  ): Promise<string> {
    const prompt = `Search Query: ${query}\n\nTask: Act as a creation assistant. Find 3-5 high-quality references, data points, or sources relevant to this query. Categorize them and explain why they are valuable for a creator.`;
    const systemPrompt = 'You are MuseRock Creation Assistant. You find deep references (scientific, historical, artistic) that others miss for creators across various disciplines.';
    
    const result = await this.generateContent({
      prompt,
      provider,
      options: { temperature: 0.3 },
    });
    
    return result.content;
  }

  private getApiKey(provider: ApiProvider): string {
    const keyMap: Record<ApiProvider, string> = {
      openai: process.env.OPENAI_API_KEY || '',
      gemini: process.env.GEMINI_API_KEY || '',
      anthropic: process.env.ANTHROPIC_API_KEY || '',
    };
    return keyMap[provider];
  }

  private getSystemPrompt(role?: string): string {
    const rolePrompts: Record<string, string> = {
      researcher: 'You are MuseRock Research Assistant. You provide well-researched, factual information with proper context.',
      writer: 'You are MuseRock Writing Assistant. You craft compelling narratives and engaging content.',
      designer: 'You are MuseRock Design Assistant. You provide creative design concepts and visual direction.',
      musician: 'You are MuseRock Music Assistant. You help with songwriting, composition, and music theory.',
    };
    return rolePrompts[role || ''] || 'You are MuseRock, an elite creation assistant.';
  }

  private async generateWithGemini(
    apiKey: string,
    prompt: string,
    systemPrompt: string,
    options: { model?: string; temperature?: number; maxTokens?: number },
  ): Promise<{ content: string; tokensUsed: { prompt: number; completion: number; total: number } }> {
    const genAI = new GoogleGenAI({ apiKey });
    const model = genAI.getGenerativeModel({
      model: options.model || 'gemini-1.5-flash',
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 2048,
      },
    });

    const response = await result.response;
    const content = response.text();
    
    const promptTokens = Math.ceil(prompt.length / 4);
    const completionTokens = Math.ceil(content.length / 4);
    
    return {
      content,
      tokensUsed: {
        prompt: promptTokens,
        completion: completionTokens,
        total: promptTokens + completionTokens,
      },
    };
  }

  private async generateWithOpenAI(
    apiKey: string,
    prompt: string,
    systemPrompt: string,
    options: { model?: string; temperature?: number; maxTokens?: number },
  ): Promise<{ content: string; tokensUsed: { prompt: number; completion: number; total: number } }> {
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    });

    const content = response.choices[0]?.message?.content || '';
    const usage = response.usage;

    return {
      content,
      tokensUsed: {
        prompt: usage?.prompt_tokens || 0,
        completion: usage?.completion_tokens || 0,
        total: usage?.total_tokens || 0,
      },
    };
  }

  private async generateWithAnthropic(
    apiKey: string,
    prompt: string,
    systemPrompt: string,
    options: { model?: string; temperature?: number; maxTokens?: number },
  ): Promise<{ content: string; tokensUsed: { prompt: number; completion: number; total: number } }> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options.maxTokens ?? 2048,
        temperature: options.temperature ?? 0.7,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new HttpException(
        `Anthropic API error: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    const usage = data.usage;

    return {
      content,
      tokensUsed: {
        prompt: usage?.input_tokens || 0,
        completion: usage?.output_tokens || 0,
        total: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
      },
    };
  }
}