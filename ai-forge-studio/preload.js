/**
 * AI Forge Studio - Preload Script
 * Exposes safe APIs to renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('AIForgeAPI', {
  // GPU Metrics
  getGpuMetrics: () => ipcRenderer.invoke('gpu:getMetrics'),
  
  // Settings
  getSetting: (key) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  getAllSettings: () => ipcRenderer.invoke('settings:get'),
  
  // AI Chat
  sendChatMessage: (payload) => ipcRenderer.invoke('ai:chat', payload),
  
  // Inference
  runInference: (config) => ipcRenderer.invoke('inference:run', config),
  
  // App
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
  
  // Navigation events
  onNavigate: (callback) => {
    ipcRenderer.on('navigate', (event, page) => callback(page));
  },
  
  removeNavigateListener: () => {
    ipcRenderer.removeAllListeners('navigate');
  }
});

console.log('AI Forge Studio API loaded');
