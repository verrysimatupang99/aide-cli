import React from 'react';
import { Box, Text } from 'ink';
import type { ChatMessage } from '../types.js';

interface ChatPaneProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const roleColors: Record<string, string> = {
  user: 'cyan',
  assistant: 'green',
  tool_call: 'yellow',
  tool_result: 'gray',
  error: 'red',
};

const roleLabels: Record<string, string> = {
  user: '  You',
  assistant: ' AIDE',
  tool_call: ' Tool',
  tool_result: '  Out',
  error: 'Error',
};

export const ChatPane: React.FC<ChatPaneProps> = ({ messages }) => {
  return (
    <Box flexDirection="column" flexGrow={1} paddingX={1} overflowY="hidden">
      {messages.slice(-50).map((msg) => (
        <Box key={msg.id} flexDirection="column" marginBottom={1}>
          <Box>
            <Text color={roleColors[msg.role] ?? 'white'} bold>
              {roleLabels[msg.role] ?? msg.role}
            </Text>
            <Text color="gray"> │ </Text>
            <Text wrap="wrap">{msg.content}</Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
