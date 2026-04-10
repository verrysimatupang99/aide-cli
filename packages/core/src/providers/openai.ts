import OpenAI from 'openai';
import type { AIProvider, ToolDefinition } from './base.js';
import type { Message, ModelConfig, StreamChunk } from '../types.js';

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';
  readonly modelConfig: ModelConfig;
  private client: OpenAI;

  constructor(config: ModelConfig) {
    this.modelConfig = config;
    this.client = new OpenAI({
      apiKey: config.apiKey ?? process.env.OPENAI_API_KEY,
      baseURL: config.baseUrl,
    });
  }

  async *streamChat(
    messages: Message[],
    tools: ToolDefinition[] = []
  ): AsyncGenerator<StreamChunk> {
    const oaiMessages = messages.map((m) => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content,
    }));

    const oaiTools: OpenAI.ChatCompletionTool[] = tools.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    const stream = await this.client.chat.completions.create({
      model: this.modelConfig.model,
      messages: oaiMessages,
      tools: oaiTools.length > 0 ? oaiTools : undefined,
      stream: true,
      temperature: this.modelConfig.temperature ?? 0.2,
      max_tokens: this.modelConfig.maxTokens,
    });

    const pendingToolCalls = new Map<number, { id: string; name: string; args: string }>();

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      if (delta.content) {
        yield { type: 'text', delta: delta.content };
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          if (!pendingToolCalls.has(tc.index)) {
            pendingToolCalls.set(tc.index, { id: tc.id ?? '', name: tc.function?.name ?? '', args: '' });
          }
          const pending = pendingToolCalls.get(tc.index)!;
          pending.args += tc.function?.arguments ?? '';
        }
      }

      if (chunk.choices[0]?.finish_reason === 'tool_calls') {
        for (const [, tc] of pendingToolCalls) {
          yield {
            type: 'tool_call',
            toolCall: {
              id: tc.id,
              name: tc.name,
              arguments: JSON.parse(tc.args || '{}'),
            },
          };
        }
      }
    }

    yield { type: 'done' };
  }
}
