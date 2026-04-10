import type { AgentMode } from '../types.js';
import type { ToolDefinition } from '../providers/base.js';
import { readFileTool } from './readFile.js';
import { writeFileTool } from './writeFile.js';
import { listFilesTool } from './listFiles.js';
import { executeCommandTool } from './executeCommand.js';
import { searchCodeTool } from './searchCode.js';

/**
 * Returns the set of tools available for a given agent mode.
 *
 * - ask:       read_file, list_files, search_code  (read-only, no execution)
 * - code:      + write_file                         (write allowed, no auto-execute)
 * - architect: + execute_command                    (full autonomy)
 */
export function getAgentTools(mode: AgentMode): ToolDefinition[] {
  const base = [readFileTool, listFilesTool, searchCodeTool];

  if (mode === 'ask') return base;
  if (mode === 'code') return [...base, writeFileTool];
  if (mode === 'architect') return [...base, writeFileTool, executeCommandTool];

  return base;
}
