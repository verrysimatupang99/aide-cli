import type { AIProvider, ToolDefinition } from './base.js';
import type { Message, ModelConfig, StreamChunk } from '../types.js';

/**
 * Connects to a local Ollama instance via its OpenAI-compatible /v1 endpoint.
 * Requires Ollama >= 0.1.24 running on the machine.
 */
export class OllamaProvider implements AIProvider {
  readonly name = 'ollama';
  readonly modelConfig: ModelConfig;
  private baseUrl: string;

  constructor(config: ModelConfig) {
    this.modelConfig = config;
    this.baseUrl = config.baseUrl ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
  }

  async *streamChat(
    messages: Message[],
    _tools: ToolDefinition[] = []
  ): AsyncGenerator<StreamChunk> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.modelConfig.model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      yield { type: 'error', message: `Ollama error: ${response.statusText}` };
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.message?.content) {
            yield { type: 'text', delta: data.message.content };
          }
          if (data.done) yield { type: 'done' };
        } catch {
          // Ignore malformed chunks
        }
      }
    }
  }
}
