import { contextBridge, ipcRenderer } from 'electron';
import type { AgentMode, ModelConfig, StreamChunk } from '@aide/core';

contextBridge.exposeInMainWorld('aide', {
  pickDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke('pick-directory'),

  sendMessage: (
    message: string,
    mode: AgentMode,
    modelConfig: ModelConfig,
    cwd: string
  ): Promise<void> =>
    ipcRenderer.invoke('agent-message', { message, mode, modelConfig, cwd }),

  onChunk: (callback: (chunk: StreamChunk) => void) => {
    ipcRenderer.on('agent-chunk', (_event, chunk) => callback(chunk));
    return () => ipcRenderer.removeAllListeners('agent-chunk');
  },
});
