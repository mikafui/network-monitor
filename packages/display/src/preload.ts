import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  onTrafficUpdate: (callback: (data: unknown) => void) => {
    ipcRenderer.on('traffic:update', (_event, data) => callback(data));
  }
});
