import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';

import { startCollector, stopCollector } from './collector/collector';

let window: BrowserWindow | null = null;

function createWindow() {
  const icon = app.isPackaged ? path.join(process.resourcesPath, 'icon.png') : path.join(process.cwd(), 'assets', 'icon.png');

  window = new BrowserWindow({
    width: 1240,
    height: 700,
    minWidth: 900,
    minHeight: 560,
    title: 'Network Monitor',
    icon,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  window.loadFile(path.join(__dirname, 'index.html'));
  window.webContents.once('did-finish-load', () => {
    startCollector(window!);
  });

  window.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => stopCollector());
ipcMain.handle('window:minimize', () => window?.minimize());
ipcMain.handle('window:close', () => window?.close());
