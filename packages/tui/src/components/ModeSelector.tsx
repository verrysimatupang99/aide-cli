import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import type { AgentMode } from '@aide/core';

interface ModeSelectorProps {
  currentMode: AgentMode;
  onSelect: (mode: AgentMode) => void;
  onCancel: () => void;
}

const modeItems = [
  { label: '⚡ Architect  — Full autonomy: read, write, run commands', value: 'architect' },
  { label: '✏️  Code       — Read & write files; confirm before commands', value: 'code' },
  { label: '💬 Ask        — Read-only planning mode, no writes or execution', value: 'ask' },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelect, onCancel }) => {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">Select Agent Mode</Text>
      <Text color="gray" dimColor>Use arrow keys + Enter to select. Esc to cancel.</Text>
      <Box marginTop={1}>
        <SelectInput
          items={modeItems}
          onSelect={(item) => onSelect(item.value as AgentMode)}
        />
      </Box>
    </Box>
  );
};
