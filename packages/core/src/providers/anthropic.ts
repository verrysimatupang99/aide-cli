import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, ToolDefinition } from './base.js';
import type { Message, ModelConfig, StreamChunk, ToolCall } from '../types.js';

export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic';
  readonly modelConfig: ModelConfig;
  private client: Anthropic;

  constructor(config: ModelConfig) {
    this.modelConfig = config;
    this.client = new Anthropic({
      apiKey: config.apiKey ?? process.env.ANTHROPIC_API_KEY,
    });
  }

  async *streamChat(
    messages: Message[],
    tools: ToolDefinition[] = []
  ): AsyncGenerator<StreamChunk> {
    const systemMessage = messages.find((m) => m.role === 'system')?.content;
    const chatMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const anthropicTools = tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters as Anthropic.Tool['input_schema'],
    }));

    const stream = this.client.messages.stream({
      model: this.modelConfig.model,
      max_tokens: this.modelConfig.maxTokens ?? 8096,
      system: systemMessage,
      messages: chatMessages,
      tools: anthropicTools.length > 0 ? anthropicTools : undefined,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield { type: 'text', delta: event.delta.text };
      } else if (
        event.type === 'content_block_start' &&
        event.content_block.type === 'tool_use'
      ) {
        // Tool call initiated – will be completed on content_block_stop
      } else if (event.type === 'message_delta' && event.usage) {
        yield {
          type: 'done',
          usage: {
            inputTokens: event.usage.output_tokens ?? 0,
            outputTokens: event.usage.output_tokens,
          },
        };
      }
    }

    // Collect full tool calls from final message
    const finalMsg = await stream.finalMessage();
    for (const block of finalMsg.content) {
      if (block.type === 'tool_use') {
        const toolCall: ToolCall = {
          id: block.id,
          name: block.name,
          arguments: block.input as Record<string, unknown>,
        };
        yield { type: 'tool_call', toolCall };
      }
    }
  }
}
