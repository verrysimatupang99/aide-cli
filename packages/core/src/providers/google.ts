import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProvider, ToolDefinition } from './base.js';
import type { Message, ModelConfig, StreamChunk } from '../types.js';

export class GoogleProvider implements AIProvider {
  readonly name = 'google';
  readonly modelConfig: ModelConfig;
  private client: GoogleGenerativeAI;

  constructor(config: ModelConfig) {
    this.modelConfig = config;
    this.client = new GoogleGenerativeAI(
      config.apiKey ?? process.env.GOOGLE_AI_API_KEY ?? ''
    );
  }

  async *streamChat(
    messages: Message[],
    _tools: ToolDefinition[] = []
  ): AsyncGenerator<StreamChunk> {
    const genModel = this.client.getGenerativeModel({
      model: this.modelConfig.model,
    });

    const history = messages
      .filter((m) => m.role !== 'system')
      .slice(0, -1)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const lastMessage = messages[messages.length - 1]?.content ?? '';
    const chat = genModel.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield { type: 'text', delta: text };
    }

    yield { type: 'done' };
  }
}
