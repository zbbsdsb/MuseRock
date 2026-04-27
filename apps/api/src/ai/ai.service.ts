import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor() {
    // In a real implementation, we would get the API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY || '';
    if (!apiKey) {
      throw new HttpException(
        'OpenAI API key is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.openai = new OpenAI({ apiKey });
  }

  async generateContent(prompt: string, role: string, parameters: Record<string, any> = {}): Promise<any> {
    try {
      const systemPrompt = this.getSystemPromptForRole(role);
      
      const response = await this.openai.chat.completions.create({
        model: parameters.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: parameters.temperature || 0.7,
        max_tokens: parameters.maxTokens || 1000,
      });

      return {
        content: response.choices[0].message.content,
        tokensUsed: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      throw new HttpException(
        `Error generating content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getSystemPromptForRole(role: string): string {
    switch (role) {
      case 'researcher':
        return `You are an expert researcher. Your task is to provide comprehensive, accurate, and well-structured research on the given topic. Include relevant sources, key findings, and a clear summary.`;
      case 'writer':
        return `You are a professional writer. Your task is to create engaging, well-structured, and grammatically correct content based on the given prompt. Adapt your style to the requested format and tone.`;
      case 'designer':
        return `You are a creative designer. Your task is to generate innovative design concepts, style guidelines, and visual descriptions based on the given requirements.`;
      case 'musician':
        return `You are a talented musician and composer. Your task is to create music concepts, genre recommendations, and musical descriptions based on the given prompt.`;
      default:
        return `You are a helpful assistant. Your task is to provide clear, concise, and accurate responses to the given prompt.`;
    }
  }
}
