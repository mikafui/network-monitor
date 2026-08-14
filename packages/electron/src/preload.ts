import { contextBridge, ipcRenderer } from 'electron';

import type { ElectronAPI } from '../../shared/electron-api';

const electronApi: ElectronAPI = {
  platform: process.platform,
  onTrafficUpdate: (callback: (data: unknown) => void) => {
    ipcRenderer.on('traffic:update', (_event, data) => callback(data));
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronApi);
