export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool_call' | 'tool_result' | 'error';
  content: string;
  timestamp: Date;
}
