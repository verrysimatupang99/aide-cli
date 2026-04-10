import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types.js';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSend }) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend(input);
        setInput('');
      }
    }
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className={`message message--${m.role}`}>
            <span className="message__role">{m.role === 'user' ? 'You' : 'AIDE'}</span>
            <pre className="message__content">{m.content}</pre>
          </div>
        ))}
        {isLoading && <div className="message message--loading">AIDE is thinking...</div>}
        <div ref={bottomRef} />
      </div>
      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AIDE... (Enter to send, Shift+Enter for newline)"
          disabled={isLoading}
          rows={3}
        />
      </div>
    </div>
  );
};
