import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { AideAgent } from '@aide/core';
import type { AgentMode, ModelConfig } from '@aide/core';

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// IPC: Open directory picker
ipcMain.handle('pick-directory', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return result.canceled ? null : result.filePaths[0];
});

// IPC: Stream a message to the agent
ipcMain.handle(
  'agent-message',
  async (
    event,
    payload: { message: string; mode: AgentMode; modelConfig: ModelConfig; cwd: string }
  ) => {
    const agent = new AideAgent({
      mode: payload.mode,
      workingDirectory: payload.cwd,
      modelConfig: payload.modelConfig,
      conversationHistory: [],
    });

    for await (const chunk of agent.run(payload.message)) {
      event.sender.send('agent-chunk', chunk);
    }
  }
);
