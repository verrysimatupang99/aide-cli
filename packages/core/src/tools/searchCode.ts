import { readFile } from 'fs/promises';
import { glob } from 'glob';
import type { ToolDefinition } from '../providers/base.js';

export const searchCodeTool: ToolDefinition = {
  name: 'search_code',
  description: 'Search for a pattern (string or regex) across all files in the project.',
  parameters: {
    type: 'object',
    properties: {
      pattern: { type: 'string', description: 'The search pattern (string or regex).' },
      filePattern: { type: 'string', description: 'Glob pattern to filter which files to search. Defaults to "**/*".' },
    },
    required: ['pattern'],
  },
};

export async function executeSearchCode(
  args: { pattern: string; filePattern?: string },
  workingDirectory: string
): Promise<string> {
  const files = await glob(args.filePattern ?? '**/*', {
    cwd: workingDirectory,
    ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    nodir: true,
  });

  const regex = new RegExp(args.pattern, 'gi');
  const results: string[] = [];

  for (const file of files) {
    try {
      const content = await readFile(`${workingDirectory}/${file}`, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (regex.test(line)) {
          results.push(`${file}:${idx + 1}: ${line.trim()}`);
        }
        regex.lastIndex = 0;
      });
    } catch {
      // Skip unreadable files
    }
  }

  return results.length > 0 ? results.join('\n') : 'No matches found.';
}
