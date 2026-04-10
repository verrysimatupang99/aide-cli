import React, { useState, useRef, useEffect } from 'react';
import { ChatWindow } from './components/ChatWindow.js';
import { Sidebar } from './components/Sidebar.js';
import { TitleBar } from './components/TitleBar.js';
import type { ChatMessage } from './types.js';
import type { AgentMode, ModelConfig } from '@aide/core';

declare global {
  interface Window {
    aide: {
      pickDirectory: () => Promise<string | null>;
      sendMessage: (msg: string, mode: AgentMode, config: ModelConfig, cwd: string) => Promise<void>;
      onChunk: (cb: (chunk: any) => void) => () => void;
    };
  }
}

export const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<AgentMode>('code');
  const [cwd, setCwd] = useState(process.cwd?.() ?? '/');
  const [isLoading, setIsLoading] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
  });

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: text, timestamp: new Date() },
    ]);
    setIsLoading(true);

    let assistantText = '';

    const cleanup = window.aide.onChunk((chunk) => {
      if (chunk.type === 'text') {
        assistantText += chunk.delta;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return [...prev.slice(0, -1), { ...last, content: assistantText }];
          }
          return [
            ...prev,
            { id: crypto.randomUUID(), role: 'assistant', content: assistantText, timestamp: new Date() },
          ];
        });
      } else if (chunk.type === 'done') {
        setIsLoading(false);
        cleanup();
      }
    });

    await window.aide.sendMessage(text, mode, modelConfig, cwd);
  };

  return (
    <div className="app">
      <TitleBar />
      <div className="layout">
        <Sidebar
          mode={mode}
          onModeChange={setMode}
          cwd={cwd}
          onCwdChange={setCwd}
          modelConfig={modelConfig}
          onModelConfigChange={setModelConfig}
        />
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
        />
      </div>
    </div>
  );
};
