import React from 'react';
import { Box, Text } from 'ink';
import type { AgentMode, ProviderName } from '@aide/core';

const modeColors: Record<AgentMode, string> = {
  architect: 'red',
  code: 'yellow',
  ask: 'blue',
};

const modeEmoji: Record<AgentMode, string> = {
  architect: '⚡',
  code: '✏️ ',
  ask: '💬',
};

interface StatusBarProps {
  mode: AgentMode;
  workingDirectory: string;
  model: string;
  provider: ProviderName;
}

export const StatusBar: React.FC<StatusBarProps> = ({ mode, workingDirectory, model, provider }) => {
  return (
    <Box
      borderStyle="single"
      borderColor="gray"
      justifyContent="space-between"
      paddingX={1}
    >
      <Box gap={1}>
        <Text bold color="cyan">AIDE</Text>
        <Text color="gray">│</Text>
        <Text color={modeColors[mode]} bold>
          {modeEmoji[mode]} {mode.toUpperCase()}
        </Text>
      </Box>
      <Box gap={1}>
        <Text color="gray">{provider}:{model}</Text>
        <Text color="gray">│</Text>
        <Text color="gray" dimColor>{workingDirectory}</Text>
      </Box>
    </Box>
  );
};
