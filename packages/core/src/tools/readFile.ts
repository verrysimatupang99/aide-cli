import { readFile } from 'fs/promises';
import { resolve } from 'path';
import type { ToolDefinition } from '../providers/base.js';

export const readFileTool: ToolDefinition = {
  name: 'read_file',
  description: 'Read the contents of a file at the given path.',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'The file path to read, relative to the working directory.' },
    },
    required: ['path'],
  },
};

export async function executeReadFile(
  args: { path: string },
  workingDirectory: string
): Promise<string> {
  const fullPath = resolve(workingDirectory, args.path);
  try {
    const content = await readFile(fullPath, 'utf-8');
    return content;
  } catch (err) {
    return `Error reading file: ${(err as Error).message}`;
  }
}
