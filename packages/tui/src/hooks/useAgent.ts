import { useState, useCallback } from 'react';
import { AideAgent } from '@aide/core';
import type { AgentMode, ProviderName, ModelConfig } from '@aide/core';
import type { ChatMessage } from '../types.js';
import type { AideConfig } from '../config.js';

interface UseAgentOptions {
  initialMode: AgentMode;
  workingDirectory: string;
  provider: ProviderName;
  model: string;
  config: AideConfig;
}

export function useAgent({
  initialMode,
  workingDirectory,
  provider,
  model,
  config,
}: UseAgentOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<AgentMode>(initialMode);

  const addMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: Math.random().toString(36).slice(2), timestamp: new Date() },
    ]);
  };

  const sendMessage = useCallback(
    async (text: string) => {
      addMessage({ role: 'user', content: text });
      setIsLoading(true);

      const modelConfig: ModelConfig = {
        provider,
        model,
        apiKey: config.apiKeys?.[provider as keyof typeof config.apiKeys],
        baseUrl: provider === 'ollama' ? config.ollamaBaseUrl : undefined,
      };

      const agent = new AideAgent({
        mode: currentMode,
        workingDirectory,
        modelConfig,
        conversationHistory: [],
      });

      let assistantText = '';

      try {
        for await (const chunk of agent.run(text)) {
          if (chunk.type === 'text') {
            assistantText += chunk.delta;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return [...prev.slice(0, -1), { ...last, content: assistantText }];
              }
              return [
                ...prev,
                { id: Math.random().toString(36).slice(2), role: 'assistant', content: assistantText, timestamp: new Date() },
              ];
            });
          } else if (chunk.type === 'tool_call') {
            addMessage({
              role: 'tool_call',
              content: `▶ ${chunk.toolCall.name}(${JSON.stringify(chunk.toolCall.arguments)})`,
            });
          } else if (chunk.type === 'tool_result') {
            addMessage({
              role: 'tool_result',
              content: chunk.toolResult.result.slice(0, 500),
            });
          } else if (chunk.type === 'error') {
            addMessage({ role: 'error', content: chunk.message });
          }
        }
      } catch (err) {
        addMessage({ role: 'error', content: (err as Error).message });
      } finally {
        setIsLoading(false);
      }
    },
    [currentMode, workingDirectory, provider, model, config]
  );

  const changeMode = useCallback((mode: AgentMode) => {
    setCurrentMode(mode);
  }, []);

  return { messages, isLoading, currentMode, sendMessage, changeMode };
}
