import type { AgentContext, Message, StreamChunk, ToolCall } from '../types.js';
import { createProvider } from '../providers/factory.js';
import { getAgentTools } from '../tools/registry.js';
import { executeReadFile } from '../tools/readFile.js';
import { executeWriteFile } from '../tools/writeFile.js';
import { executeListFiles } from '../tools/listFiles.js';
import { executeCommand } from '../tools/executeCommand.js';
import { executeSearchCode } from '../tools/searchCode.js';

const SYSTEM_PROMPTS: Record<string, string> = {
  architect: `You are AIDE, an expert AI coding assistant operating in ARCHITECT mode.
You have full autonomy to read files, write code, and execute shell commands.
Be decisive and efficient. Always explain what you are doing before doing it.`,

  code: `You are AIDE, an expert AI coding assistant operating in CODE mode.
You can read and write files freely but will ask the user for confirmation before executing any shell commands.
Be precise and careful with code changes.`,

  ask: `You are AIDE, an expert AI coding assistant operating in ASK (planning) mode.
You can read files and analyze code but you CANNOT write files or execute commands.
Focus on understanding the codebase and providing detailed plans and suggestions.`,
};

export class AideAgent {
  private context: AgentContext;

  constructor(context: AgentContext) {
    this.context = context;
  }

  async *run(userMessage: string): AsyncGenerator<StreamChunk> {
    const provider = createProvider(this.context.modelConfig);
    const tools = getAgentTools(this.context.mode);

    this.context.conversationHistory.push({ role: 'user', content: userMessage });

    const messages: Message[] = [
      {
        role: 'system',
        content: this.context.systemPrompt ?? SYSTEM_PROMPTS[this.context.mode] ?? SYSTEM_PROMPTS.ask,
      },
      ...this.context.conversationHistory,
    ];

    // Agentic loop: keep running until no more tool calls
    let assistantText = '';
    const pendingToolCalls: ToolCall[] = [];

    for await (const chunk of provider.streamChat(messages, tools)) {
      if (chunk.type === 'text') {
        assistantText += chunk.delta;
        yield chunk;
      } else if (chunk.type === 'tool_call') {
        pendingToolCalls.push(chunk.toolCall);
        yield chunk;
      } else if (chunk.type === 'done') {
        yield chunk;
      } else if (chunk.type === 'error') {
        yield chunk;
        return;
      }
    }

    if (assistantText) {
      this.context.conversationHistory.push({ role: 'assistant', content: assistantText });
    }

    // Execute tool calls and loop if there were any
    if (pendingToolCalls.length > 0) {
      for (const tc of pendingToolCalls) {
        const result = await this.executeTool(tc);
        yield { type: 'tool_result', toolResult: { toolCallId: tc.id, result } };
        this.context.conversationHistory.push({
          role: 'tool',
          content: result,
          toolCallId: tc.id,
          toolName: tc.name,
        });
      }
    }
  }

  private async executeTool(toolCall: ToolCall): Promise<string> {
    const args = toolCall.arguments as Record<string, unknown>;
    const cwd = this.context.workingDirectory;

    switch (toolCall.name) {
      case 'read_file':
        return executeReadFile(args as { path: string }, cwd);
      case 'write_file':
        return executeWriteFile(args as { path: string; content: string }, cwd);
      case 'list_files':
        return executeListFiles(args as { pattern?: string }, cwd);
      case 'execute_command':
        return executeCommand(args as { command: string; timeoutMs?: number }, cwd);
      case 'search_code':
        return executeSearchCode(args as { pattern: string; filePattern?: string }, cwd);
      default:
        return `Unknown tool: ${toolCall.name}`;
    }
  }

  updateMode(mode: AgentContext['mode']) {
    this.context.mode = mode;
  }

  getHistory(): Message[] {
    return this.context.conversationHistory;
  }

  clearHistory() {
    this.context.conversationHistory = [];
  }
}
