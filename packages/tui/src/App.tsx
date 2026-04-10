import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import type { AgentMode, ProviderName } from '@aide/core';
import { ChatPane } from './components/ChatPane.js';
import { InputBar } from './components/InputBar.js';
import { StatusBar } from './components/StatusBar.js';
import { ModeSelector } from './components/ModeSelector.js';
import { useAgent } from './hooks/useAgent.js';
import type { AideConfig } from './config.js';

interface AppProps {
  mode: AgentMode;
  workingDirectory: string;
  provider: ProviderName;
  model: string;
  config: AideConfig;
}

export const App: React.FC<AppProps> = ({
  mode: initialMode,
  workingDirectory,
  provider,
  model,
  config,
}) => {
  const { exit } = useApp();
  const [showModeSelector, setShowModeSelector] = useState(false);

  const { messages, isLoading, currentMode, sendMessage, changeMode } = useAgent({
    initialMode,
    workingDirectory,
    provider,
    model,
    config,
  });

  useInput((input, key) => {
    if (key.ctrl && input === 'c') exit();
    if (key.ctrl && input === 'm') setShowModeSelector((v) => !v);
  });

  const handleSubmit = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      sendMessage(text);
    },
    [sendMessage]
  );

  return (
    <Box flexDirection="column" height="100%">
      <StatusBar mode={currentMode} workingDirectory={workingDirectory} model={model} provider={provider} />

      {showModeSelector ? (
        <ModeSelector
          currentMode={currentMode}
          onSelect={(m) => {
            changeMode(m);
            setShowModeSelector(false);
          }}
          onCancel={() => setShowModeSelector(false)}
        />
      ) : (
        <ChatPane messages={messages} isLoading={isLoading} />
      )}

      <InputBar
        isLoading={isLoading}
        onSubmit={handleSubmit}
        placeholder={`Ask AIDE (${currentMode} mode) — Ctrl+M to switch mode, Ctrl+C to exit`}
      />
    </Box>
  );
};
