import { glob } from 'glob';
import type { ToolDefinition } from '../providers/base.js';

export const listFilesTool: ToolDefinition = {
  name: 'list_files',
  description: 'List files and directories matching a glob pattern in the project.',
  parameters: {
    type: 'object',
    properties: {
      pattern: { type: 'string', description: 'Glob pattern to match files. Defaults to "**/*" for all files.' },
    },
    required: [],
  },
};

export async function executeListFiles(
  args: { pattern?: string },
  workingDirectory: string
): Promise<string> {
  try {
    const files = await glob(args.pattern ?? '**/*', {
      cwd: workingDirectory,
      ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
      nodir: true,
    });
    return files.sort().join('\n') || 'No files found.';
  } catch (err) {
    return `Error listing files: ${(err as Error).message}`;
  }
}
