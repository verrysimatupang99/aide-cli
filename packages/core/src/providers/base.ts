import type { Message, StreamChunk, ModelConfig } from '../types.js';

export interface AIProvider {
  readonly name: string;
  readonly modelConfig: ModelConfig;

  /**
   * Stream a chat completion. Yields StreamChunk objects.
   * Tools are defined by the agent layer and passed here.
   */
  streamChat(
    messages: Message[],
    tools?: ToolDefinition[]
  ): AsyncGenerator<StreamChunk>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema object
}
