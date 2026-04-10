import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';

interface InputBarProps {
  isLoading: boolean;
  onSubmit: (text: string) => void;
  placeholder?: string;
}

export const InputBar: React.FC<InputBarProps> = ({ isLoading, onSubmit, placeholder }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (text: string) => {
    if (!text.trim() || isLoading) return;
    onSubmit(text);
    setValue('');
  };

  return (
    <Box borderStyle="round" borderColor="cyan" paddingX={1}>
      {isLoading ? (
        <Box>
          <Text color="cyan"><Spinner type="dots" /></Text>
          <Text color="gray"> Thinking...</Text>
        </Box>
      ) : (
        <Box>
          <Text color="cyan">❯ </Text>
          <TextInput
            value={value}
            onChange={setValue}
            onSubmit={handleSubmit}
            placeholder={placeholder}
          />
        </Box>
      )}
    </Box>
  );
};
