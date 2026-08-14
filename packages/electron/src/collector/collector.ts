import type { BrowserWindow } from 'electron';
import type { Server, Socket } from 'node:net';

import { app } from 'electron';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';

let sockets: Set<Socket> | null = null;
let server: Server | null = null;

function collectorPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'collector', 'NetworkMonitor.Collector.exe');
  }

  return path.resolve(__dirname, '..', '..', '..', 'collector', 'bin', 'Release', 'net10.0-windows', 'NetworkMonitor.Collector.exe');
}

export function startCollector(window: BrowserWindow) {
  const pipeName = `network-monitor-${process.pid}-${randomUUID()}`;
  sockets = new Set<Socket>();
  server = startPipeServer(window, pipeName, sockets);

  server.once('listening', () => {
    console.log(`Pipe lauscht: \\\\.\\pipe\\${pipeName}`);
    window.webContents.send('traffic:update', { type: 'status', message: 'Pipe lauscht. Collector wird gestartet.' });
    startElevatedCollector(window, pipeName);
  });
}

export function stopCollector() {
  if (sockets) {
    for (const socket of sockets) {
      socket.destroy();
    }

    sockets.clear();
    sockets = null;
  }

  if (server?.listening) {
    server.close();
    server.unref();
    server.removeAllListeners();
    server = null;
  }
}

function startElevatedCollector(window: BrowserWindow, pipeName: string): void {
  const collectorExecutable = collectorPath();

  if (!existsSync(collectorExecutable)) {
    window.webContents.send('traffic:update', {
      type: 'error',
      message: `Collector wurde nicht gefunden: ${collectorExecutable}. Bitte zuerst den Collector bauen.`
    });
    return;
  }

  const executable = collectorExecutable.replaceAll("'", "''");
  const command = [
    "$ErrorActionPreference = 'Stop'",
    `$process = Start-Process -FilePath '${executable}' -ArgumentList '--pipe','${pipeName}' -Verb RunAs -WindowStyle Hidden -PassThru`,
    '$process.WaitForExit()',
    'exit $process.ExitCode'
  ].join('; ');

  const launcher = spawn('powershell.exe', ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', command], {
    windowsHide: true,
    stdio: ['ignore', 'ignore', 'pipe']
  });

  let stderr = '';
  launcher.stderr?.setEncoding('utf8');
  launcher.stderr?.on('data', chunk => {
    stderr += chunk;
  });

  launcher.on('error', error => {
    window.webContents.send('traffic:update', { type: 'error', message: `Collector konnte nicht gestartet werden: ${error.message}` });
  });

  launcher.on('exit', code => {
    if (code) {
      window.webContents.send('traffic:update', {
        type: 'error',
        message: stderr.trim() || 'Collector wurde nicht gestartet. Die UAC-Abfrage wurde möglicherweise abgebrochen.'
      });
    }
  });
}

function startPipeServer(window: BrowserWindow, pipeName: string, sockets: Set<Socket>): Server {
  const server = net.createServer(socket => {
    console.log('C#-Collector ist mit der Pipe verbunden.');
    window.webContents.send('traffic:update', { type: 'status', message: 'C#-Collector ist mit der Pipe verbunden.' });
    server.close();
    sockets.add(socket);
    socket.setEncoding('utf8');
    let buffer = '';

    socket.on('data', chunk => {
      buffer += chunk;

      while (true) {
        const index = buffer.indexOf('\n');
        if (index === -1) {
          break;
        }

        const line = buffer.slice(0, index).trim();
        buffer = buffer.slice(index + 1);

        if (!line) {
          continue;
        }

        console.log(line);

        try {
          window.webContents.send('traffic:update', JSON.parse(line));
        } catch {
          window.webContents.send('traffic:update', { type: 'error', message: 'Ungültige Antwort des Collectors.' });
        }
      }
    });

    socket.on('close', () => sockets.delete(socket));
    socket.on('error', error => console.error('Pipe error:', error));
  });
  server.maxConnections = 1;

  server.on('error', error => {
    console.error('Pipe server error:', error);
    window.webContents.send('traffic:update', { type: 'error', message: `Pipe konnte nicht geöffnet werden: ${error.message}` });
  });
  server.listen(`\\\\.\\pipe\\${pipeName}`);
  return server;
}
