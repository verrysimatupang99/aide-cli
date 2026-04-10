import { z } from 'zod';

// ─── Provider & Model ────────────────────────────────────────────────────────

export type ProviderName = 'openai' | 'anthropic' | 'google' | 'ollama';

export interface ModelConfig {
  provider: ProviderName;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

// ─── Messages ────────────────────────────────────────────────────────────────

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface Message {
  role: MessageRole;
  content: string;
  toolCallId?: string;
  toolName?: string;
}

// ─── Tools ───────────────────────────────────────────────────────────────────

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  result: string;
  isError?: boolean;
}

// ─── Agent Modes ─────────────────────────────────────────────────────────────

export type AgentMode = 'architect' | 'code' | 'ask';

/**
 * architect – Full autonomy: read, write files, run commands freely.
 * code      – Can read/write files but asks before executing shell commands.
 * ask       – Read-only planning mode. No writes, no command execution.
 */
export const AgentModeSchema = z.enum(['architect', 'code', 'ask']);

// ─── Agent Context ───────────────────────────────────────────────────────────

export interface AgentContext {
  mode: AgentMode;
  workingDirectory: string;
  modelConfig: ModelConfig;
  conversationHistory: Message[];
  systemPrompt?: string;
}

// ─── Streaming ───────────────────────────────────────────────────────────────

export type StreamChunk =
  | { type: 'text'; delta: string }
  | { type: 'tool_call'; toolCall: ToolCall }
  | { type: 'tool_result'; toolResult: ToolResult }
  | { type: 'done'; usage?: { inputTokens: number; outputTokens: number } }
  | { type: 'error'; message: string };
