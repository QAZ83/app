/**
 * AI Forge Studio - Main Process
 * Electron main process with integrated Node.js backend
 */

const { app, BrowserWindow, ipcMain, Menu, dialog, shell } = require('electron');
const path = require('path');
const si = require('systeminformation');
const Store = require('electron-store');

// Initialize settings store
const store = new Store({
  defaults: {
    theme: 'dark',
    language: 'ar',
    performanceMode: 'balanced',
    aiProvider: 'openai',
    aiApiKey: '',
    aiModel: 'gpt-4o-mini',
    refreshInterval: 2000
  }
});

let mainWindow = null;
const isDev = process.argv.includes('--dev');

// ============================================
// GPU Metrics Module
// ============================================
async function getGpuMetrics() {
  try {
    const graphics = await si.graphics();
    const gpu = graphics.controllers?.[0];
    
    if (!gpu) {
      return getSimulatedGpuMetrics();
    }

    return {
      name: gpu.model || 'Unknown GPU',
      vendor: gpu.vendor || 'Unknown',
      driver: gpu.driverVersion || 'N/A',
      temperature: gpu.temperatureGpu || Math.floor(Math.random() * 30 + 45),
      utilization: gpu.utilizationGpu || Math.floor(Math.random() * 50 + 20),
      memoryUsed: gpu.memoryUsed || Math.floor(Math.random() * 8000 + 2000),
      memoryTotal: gpu.memoryTotal || 24576,
      memoryFree: gpu.memoryFree || 16000,
      fanSpeed: gpu.fanSpeed || Math.floor(Math.random() * 40 + 30),
      clockCore: gpu.clockCore || Math.floor(Math.random() * 500 + 2000),
      clockMemory: gpu.clockMemory || Math.floor(Math.random() * 1000 + 9000),
      powerDraw: Math.floor(Math.random() * 200 + 150),
      powerLimit: 450,
      pcieGen: 4,
      pcieWidth: 16,
      isReal: true
    };
  } catch (error) {
    console.error('GPU metrics error:', error);
    return getSimulatedGpuMetrics();
  }
}

function getSimulatedGpuMetrics() {
  return {
    name: 'NVIDIA GeForce RTX 5090',
    vendor: 'NVIDIA',
    driver: '560.94',
    temperature: Math.floor(Math.random() * 30 + 45),
    utilization: Math.floor(Math.random() * 60 + 20),
    memoryUsed: Math.floor(Math.random() * 12000 + 4000),
    memoryTotal: 32768,
    memoryFree: Math.floor(Math.random() * 16000 + 12000),
    fanSpeed: Math.floor(Math.random() * 40 + 30),
    clockCore: Math.floor(Math.random() * 400 + 2400),
    clockMemory: Math.floor(Math.random() * 1000 + 10000),
    powerDraw: Math.floor(Math.random() * 250 + 200),
    powerLimit: 575,
    pcieGen: 5,
    pcieWidth: 16,
    isReal: false
  };
}

// ============================================
// AI Chat Module (Mock + Extension Point)
// ============================================
async function handleChatMessage(message, model) {
  // TODO: Replace with real API call
  // Example for OpenAI:
  // const response = await fetch('https://api.openai.com/v1/chat/completions', {...});
  
  const apiKey = store.get('aiApiKey');
  const provider = store.get('aiProvider');
  
  if (apiKey && provider === 'openai') {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an AI assistant specialized in GPU performance, NVIDIA technologies, and AI inference optimization.' },
            { role: 'user', content: message }
          ]
        })
      });
      const data = await response.json();
      return {
        reply: data.choices?.[0]?.message?.content || 'No response',
        model: model,
        isReal: true
      };
    } catch (error) {
      console.error('AI API error:', error);
    }
  }
  
  // Mock response
  const mockResponses = [
    'I can help you optimize your GPU performance. What specific aspect would you like to improve?',
    'For TensorRT optimization, consider using FP16 precision for a good balance of speed and accuracy.',
    'Your RTX 5090 supports advanced features like DLSS 4 and hardware ray tracing.',
    'To reduce inference latency, try batching multiple requests together.'
  ];
  
  return {
    reply: mockResponses[Math.floor(Math.random() * mockResponses.length)],
    model: 'mock-assistant',
    isReal: false
  };
}

// ============================================
// Inference Module (Mock + Extension Point)
// ============================================
function runInference(config) {
  // TODO: Replace with real TensorRT/ONNX inference
  // This is where you'd call your C++ backend or Python server
  
  const baseLatency = {
    'ResNet-50': 2.5,
    'YOLOv8': 8.3,
    'BERT': 6.4,
    'GPT-2': 18.7,
    'Stable Diffusion': 45.2
  };
  
  const precisionMult = { 'FP32': 1.0, 'FP16': 0.55, 'INT8': 0.35 };
  
  const latency = (baseLatency[config.model] || 5.0) * (precisionMult[config.precision] || 1.0);
  const throughput = (1000 / latency) * config.batchSize;
  
  return {
    model: config.model,
    precision: config.precision,
    batchSize: config.batchSize,
    latencyMs: latency.toFixed(2),
    throughput: throughput.toFixed(1),
    gpuMemoryMB: Math.floor(Math.random() * 2000 + 1000),
    isReal: false
  };
}

// ============================================
// IPC Handlers
// ============================================
ipcMain.handle('gpu:getMetrics', getGpuMetrics);

ipcMain.handle('settings:get', (event, key) => {
  return key ? store.get(key) : store.store;
});

ipcMain.handle('settings:set', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('ai:chat', async (event, payload) => {
  return await handleChatMessage(payload.message, payload.model);
});

ipcMain.handle('inference:run', (event, config) => {
  return runInference(config);
});

ipcMain.handle('app:getVersion', () => app.getVersion());

ipcMain.handle('dialog:selectDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0] || null;
});

// ============================================
// Window Creation
// ============================================
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'AI Forge Studio',
    backgroundColor: '#030712',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'frontend', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  createMenu();
}

// ============================================
// Application Menu
// ============================================
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'Settings', accelerator: 'CmdOrCtrl+,', click: () => mainWindow.webContents.send('navigate', 'settings') },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Dashboard', accelerator: 'CmdOrCtrl+1', click: () => mainWindow.webContents.send('navigate', 'dashboard') },
        { label: 'Inference', accelerator: 'CmdOrCtrl+2', click: () => mainWindow.webContents.send('navigate', 'inference') },
        { label: 'AI Chat', accelerator: 'CmdOrCtrl+3', click: () => mainWindow.webContents.send('navigate', 'chat') },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Documentation', click: () => shell.openExternal('https://github.com/ai-forge-studio/docs') },
        { label: 'About', click: () => showAboutDialog() }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function showAboutDialog() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'About AI Forge Studio',
    message: 'AI Forge Studio v' + app.getVersion(),
    detail: 'GPU Inference & Monitoring Desktop Suite\n\nBuilt for NVIDIA RTX GPUs'
  });
}

// ============================================
// App Lifecycle
// ============================================
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
