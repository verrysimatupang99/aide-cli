import { spawn } from 'child_process';
import type { ToolDefinition } from '../providers/base.js';

export const executeCommandTool: ToolDefinition = {
  name: 'execute_command',
  description: 'Execute a shell command in the project working directory. Use with caution.',
  parameters: {
    type: 'object',
    properties: {
      command: { type: 'string', description: 'The shell command to execute.' },
      timeoutMs: { type: 'number', description: 'Timeout in milliseconds. Defaults to 30000.' },
    },
    required: ['command'],
  },
};

export async function executeCommand(
  args: { command: string; timeoutMs?: number },
  workingDirectory: string
): Promise<string> {
  return new Promise((resolve) => {
    const timeout = args.timeoutMs ?? 30_000;
    let stdout = '';
    let stderr = '';

    const proc = spawn('sh', ['-c', args.command], {
      cwd: workingDirectory,
      env: process.env,
    });

    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

    const timer = setTimeout(() => {
      proc.kill();
      resolve(`Command timed out after ${timeout}ms`);
    }, timeout);

    proc.on('close', (code) => {
      clearTimeout(timer);
      const output = [stdout, stderr].filter(Boolean).join('\n');
      resolve(`Exit code: ${code}\n${output}`);
    });
  });
}
