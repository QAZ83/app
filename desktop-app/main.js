/**
 * AI Forge Studio - Electron Main Process
 * Handles window creation and backend server management
 */

const { app, BrowserWindow, ipcMain, Menu, shell, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const Store = require('electron-store');

// Initialize store for settings
const store = new Store({
  defaults: {
    windowBounds: { width: 1400, height: 900 },
    backendPort: 8080
  }
});

let mainWindow = null;
let backendProcess = null;
let backendPort = store.get('backendPort');
const isDev = process.argv.includes('--dev');

// Backend server management
function startBackend() {
  const backendPath = isDev 
    ? path.join(__dirname, 'backend')
    : path.join(process.resourcesPath, 'backend');
  
  const pythonPath = process.platform === 'win32' ? 'python' : 'python3';
  
  console.log('Starting backend server...');
  console.log('Backend path:', backendPath);
  
  backendProcess = spawn(pythonPath, [
    '-m', 'uvicorn',
    'server:app',
    '--host', '127.0.0.1',
    '--port', backendPort.toString(),
    '--reload'
  ], {
    cwd: backendPath,
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });
  
  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });
  
  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });
  
  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
  
  backendProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
    dialog.showErrorBox('Backend Error', 
      'Failed to start the backend server. Please ensure Python is installed and in your PATH.');
  });
}

function stopBackend() {
  if (backendProcess) {
    console.log('Stopping backend server...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', backendProcess.pid, '/f', '/t']);
    } else {
      backendProcess.kill('SIGTERM');
    }
    backendProcess = null;
  }
}

// Create main window
function createWindow() {
  const { width, height } = store.get('windowBounds');
  
  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 1200,
    minHeight: 700,
    title: 'AI Forge Studio',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#030712',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });
  
  // Load the app
  if (isDev) {
    // In development, load from React dev server
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built React app
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  }
  
  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  
  // Save window size on resize
  mainWindow.on('resize', () => {
    const { width, height } = mainWindow.getBounds();
    store.set('windowBounds', { width, height });
  });
  
  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Create application menu
  createMenu();
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('navigate', 'settings');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => mainWindow.webContents.send('navigate', 'dashboard')
        },
        {
          label: 'Benchmarks',
          accelerator: 'CmdOrCtrl+2',
          click: () => mainWindow.webContents.send('navigate', 'benchmarks')
        },
        {
          label: 'Inference',
          accelerator: 'CmdOrCtrl+3',
          click: () => mainWindow.webContents.send('navigate', 'inference')
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'AI Assistant',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => mainWindow.webContents.send('toggle-ai-assistant')
        },
        { type: 'separator' },
        {
          label: 'Open Models Folder',
          click: () => {
            const modelsPath = path.join(app.getPath('userData'), 'models');
            shell.openPath(modelsPath);
          }
        },
        {
          label: 'Open Config Folder',
          click: () => shell.openPath(app.getPath('userData'))
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About AI Forge Studio',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About AI Forge Studio',
              message: 'AI Forge Studio v2.0.0',
              detail: 'GPU Monitoring & AI Inference Desktop Application\n\nPowered by NVIDIA RTX'
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://github.com/ai-forge-studio/docs')
        },
        {
          label: 'Report Issue',
          click: () => shell.openExternal('https://github.com/ai-forge-studio/issues')
        }
      ]
    }
  ];
  
  // macOS specific menu
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('get-backend-url', () => {
  return `http://127.0.0.1:${backendPort}`;
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0] || null;
});

ipcMain.handle('select-file', async (event, filters) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: filters || [{ name: 'ONNX Models', extensions: ['onnx'] }]
  });
  return result.filePaths[0] || null;
});

// App event handlers
app.whenReady().then(() => {
  startBackend();
  
  // Wait for backend to start
  setTimeout(createWindow, 2000);
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopBackend();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox('Error', error.message);
});
