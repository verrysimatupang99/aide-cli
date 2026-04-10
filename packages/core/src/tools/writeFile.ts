import { writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import type { ToolDefinition } from '../providers/base.js';

export const writeFileTool: ToolDefinition = {
  name: 'write_file',
  description: 'Write content to a file. Creates the file and any necessary directories.',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'The file path to write to, relative to the working directory.' },
      content: { type: 'string', description: 'The full content to write to the file.' },
    },
    required: ['path', 'content'],
  },
};

export async function executeWriteFile(
  args: { path: string; content: string },
  workingDirectory: string
): Promise<string> {
  const fullPath = resolve(workingDirectory, args.path);
  try {
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, args.content, 'utf-8');
    return `Successfully wrote ${args.content.length} characters to ${args.path}`;
  } catch (err) {
    return `Error writing file: ${(err as Error).message}`;
  }
}
