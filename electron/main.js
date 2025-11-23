import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Reconstruct __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const isDev = !app.isPackaged;
  
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    title: "JFARM Dashboard",
    backgroundColor: '#F1F3E0',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Use preload.js in the same directory
      preload: path.join(__dirname, 'preload.js')
    },
    // Ensure icon path is correct relative to this file
    icon: path.join(__dirname, '../public/favicon.ico'),
    autoHideMenuBar: true // Hide menu bar by default for a cleaner look
  });

  if (isDev) {
    // In development, load from the Vite dev server
    // Ensure your vite server is running on port 5173
    win.loadURL('http://localhost:5173');
    // win.webContents.openDevTools();
  } else {
    // In production, load the built index.html
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
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