/**
 * AI Forge Studio - Main Application Script
 * Handles UI rendering, navigation, and API interactions
 */

// ============================================
// Application State
// ============================================
const AppState = {
  currentPage: 'dashboard',
  gpuMetrics: null,
  settings: {},
  chatMessages: [],
  chatOpen: false,
  inferenceLog: [],
  isLoading: false
};

// ============================================
// Icons (SVG)
// ============================================
const Icons = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  inference: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  gpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="8" y="8" width="8" height="8"/><line x1="4" y1="12" x2="2" y2="12"/><line x1="22" y1="12" x2="20" y2="12"/><line x1="12" y1="4" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="20"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  robot: '🤖',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
};

// ============================================
// API Wrapper
// ============================================
const API = {
  async getGpuMetrics() {
    if (window.AIForgeAPI) {
      return await window.AIForgeAPI.getGpuMetrics();
    }
    // Fallback for browser testing
    return {
      name: 'NVIDIA GeForce RTX 5090 (Demo)',
      vendor: 'NVIDIA',
      driver: '560.94',
      temperature: Math.floor(Math.random() * 30 + 45),
      utilization: Math.floor(Math.random() * 60 + 20),
      memoryUsed: Math.floor(Math.random() * 12000 + 4000),
      memoryTotal: 32768,
      fanSpeed: Math.floor(Math.random() * 40 + 30),
      clockCore: Math.floor(Math.random() * 400 + 2400),
      powerDraw: Math.floor(Math.random() * 250 + 200),
      powerLimit: 575,
      isReal: false
    };
  },

  async sendChatMessage(message, model) {
    if (window.AIForgeAPI) {
      return await window.AIForgeAPI.sendChatMessage({ message, model });
    }
    // Mock response
    await new Promise(r => setTimeout(r, 1000));
    return {
      reply: 'This is a demo response. Connect to a real AI backend for actual responses.',
      model: 'demo',
      isReal: false
    };
  },

  async runInference(config) {
    if (window.AIForgeAPI) {
      return await window.AIForgeAPI.runInference(config);
    }
    // Mock response
    await new Promise(r => setTimeout(r, 500));
    return {
      model: config.model,
      precision: config.precision,
      batchSize: config.batchSize,
      latencyMs: (Math.random() * 10 + 2).toFixed(2),
      throughput: (Math.random() * 500 + 100).toFixed(1),
      gpuMemoryMB: Math.floor(Math.random() * 2000 + 1000),
      isReal: false
    };
  },

  async getSetting(key) {
    if (window.AIForgeAPI) {
      return await window.AIForgeAPI.getSetting(key);
    }
    return AppState.settings[key];
  },

  async setSetting(key, value) {
    if (window.AIForgeAPI) {
      return await window.AIForgeAPI.setSetting(key, value);
    }
    AppState.settings[key] = value;
    return true;
  }
};

// ============================================
// Component Renderers
// ============================================
function renderSidebar() {
  const navItems = [
    { id: 'dashboard', icon: Icons.dashboard, label: 'لوحة التحكم' },
    { id: 'inference', icon: Icons.inference, label: 'الاستدلال' },
    { id: 'settings', icon: Icons.settings, label: 'الإعدادات' }
  ];

  return `
    <div class="sidebar-header">
      <div class="sidebar-logo">AI Forge Studio</div>
      <div class="sidebar-subtitle">${AppState.gpuMetrics?.isReal ? '🟢 GPU متصل' : '🟡 وضع العرض'}</div>
    </div>
    <nav class="sidebar-nav">
      ${navItems.map(item => `
        <div class="nav-item ${AppState.currentPage === item.id ? 'active' : ''}" onclick="navigateTo('${item.id}')">
          <span class="nav-icon">${item.icon}</span>
          <span>${item.label}</span>
        </div>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <button class="chat-toggle-btn" onclick="toggleChat()">
        ${Icons.robot} مساعد الذكاء
      </button>
    </div>
  `;
}

function renderTopbar() {
  const titles = {
    dashboard: 'لوحة التحكم',
    inference: 'الاستدلال',
    settings: 'الإعدادات'
  };

  return `
    <h1 class="page-title">${titles[AppState.currentPage] || 'AI Forge Studio'}</h1>
    <div class="status-badge ${AppState.gpuMetrics?.isReal ? '' : 'warning'}">
      <span class="status-dot"></span>
      <span>${AppState.gpuMetrics?.isReal ? 'GPU حقيقي' : 'محاكاة'}</span>
    </div>
  `;
}

function renderDashboard() {
  const gpu = AppState.gpuMetrics || {};
  const memPercent = gpu.memoryTotal ? ((gpu.memoryUsed / gpu.memoryTotal) * 100).toFixed(1) : 0;
  const memUsedGB = gpu.memoryUsed ? (gpu.memoryUsed / 1024).toFixed(1) : 0;
  const memTotalGB = gpu.memoryTotal ? (gpu.memoryTotal / 1024).toFixed(1) : 0;

  return `
    <div class="animate-fadeIn">
      <!-- GPU Info Card -->
      <div class="gpu-info-card mb-4">
        <div class="gpu-header">
          <div class="gpu-icon">${Icons.gpu}</div>
          <div>
            <div class="gpu-name">${gpu.name || 'Loading...'}</div>
            <div class="gpu-driver">Driver: ${gpu.driver || 'N/A'}</div>
          </div>
        </div>
        
        <div class="memory-section">
          <div class="memory-header">
            <span class="memory-label">الذاكرة</span>
            <span class="memory-value">${memUsedGB} / ${memTotalGB} GB</span>
          </div>
          <div class="memory-bar">
            <div class="memory-bar-fill" style="width: ${memPercent}%"></div>
          </div>
        </div>

        <div class="grid grid-cols-4">
          ${renderMetricCard('درجة الحرارة', gpu.temperature, '°C', 100, 'primary')}
          ${renderMetricCard('استخدام GPU', gpu.utilization, '%', 100, 'success')}
          ${renderMetricCard('استهلاك الطاقة', gpu.powerDraw, 'W', gpu.powerLimit || 575, 'warning')}
          ${renderMetricCard('سرعة الساعة', gpu.clockCore, 'MHz', 3000, 'purple')}
        </div>
      </div>

      <!-- Additional Metrics -->
      <div class="grid grid-cols-4">
        ${renderMetricCard('سرعة المروحة', gpu.fanSpeed, '%', 100, 'primary')}
        ${renderMetricCard('PCIe Gen', gpu.pcieGen || 5, '', 5, 'success')}
        ${renderMetricCard('PCIe Width', gpu.pcieWidth || 16, 'x', 16, 'purple')}
        ${renderMetricCard('الحد الأقصى للطاقة', gpu.powerLimit, 'W', 600, 'warning')}
      </div>
    </div>
  `;
}

function renderMetricCard(label, value, unit, max, color) {
  const percent = max ? ((value || 0) / max * 100) : 0;
  return `
    <div class="metric-card">
      <div class="metric-label">${label}</div>
      <div class="metric-value ${color}">${value || 0}${unit}</div>
      <div class="metric-bar">
        <div class="metric-bar-fill ${color}" style="width: ${percent}%"></div>
      </div>
    </div>
  `;
}

function renderInference() {
  return `
    <div class="animate-fadeIn">
      <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 24px;">
        <!-- Controls -->
        <div class="card">
          <h3 class="mb-4 font-semibold text-lg">إعدادات الاستدلال</h3>
          
          <div class="form-group">
            <label class="form-label">النموذج</label>
            <select id="inference-model" class="form-select">
              <option value="ResNet-50">ResNet-50</option>
              <option value="YOLOv8">YOLOv8</option>
              <option value="BERT">BERT</option>
              <option value="GPT-2">GPT-2</option>
              <option value="Stable Diffusion">Stable Diffusion</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">الدقة</label>
            <div class="radio-group" id="precision-group">
              <button class="radio-btn" data-value="FP32">FP32</button>
              <button class="radio-btn active" data-value="FP16">FP16</button>
              <button class="radio-btn" data-value="INT8">INT8</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">حجم الدفعة</label>
            <input type="number" id="inference-batch" class="form-input" value="1" min="1" max="64">
          </div>

          <button class="btn btn-primary" onclick="runInference()" style="width: 100%">
            ${Icons.play} تشغيل الاستدلال
          </button>
        </div>

        <!-- Results -->
        <div class="card">
          <h3 class="mb-4 font-semibold text-lg">النتائج</h3>
          <div id="inference-results">
            <p style="color: var(--text-secondary); text-align: center; padding: 40px 0;">
              شغّل استدلالاً لرؤية النتائج
            </p>
          </div>
        </div>
      </div>

      <!-- Run Log -->
      <div class="card mt-4">
        <h3 class="mb-4 font-semibold text-lg">سجل التشغيل</h3>
        <div class="run-log" id="run-log">
          ${AppState.inferenceLog.length === 0 ? 
            '<p style="color: var(--text-muted);">لا توجد عمليات مسجلة</p>' :
            AppState.inferenceLog.map(log => `
              <div class="log-entry">
                <span class="log-time">${log.time}</span>
                <span class="log-message">${log.message}</span>
              </div>
            `).join('')
          }
        </div>
      </div>
    </div>
  `;
}

function renderSettings() {
  return `
    <div class="animate-fadeIn">
      <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 24px;">
        <!-- General Settings -->
        <div class="card">
          <div class="settings-section">
            <h3 class="settings-title">الإعدادات العامة</h3>
            
            <div class="form-group">
              <label class="form-label">وضع الأداء</label>
              <select id="setting-performance" class="form-select" onchange="updateSetting('performanceMode', this.value)">
                <option value="performance">أداء عالي</option>
                <option value="balanced" selected>متوازن</option>
                <option value="silent">هادئ</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">معدل التحديث</label>
              <select id="setting-refresh" class="form-select" onchange="updateSetting('refreshInterval', this.value)">
                <option value="1000">1 ثانية</option>
                <option value="2000" selected>2 ثانية</option>
                <option value="5000">5 ثوانٍ</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">اللغة</label>
              <select id="setting-language" class="form-select" onchange="updateSetting('language', this.value)">
                <option value="ar" selected>العربية</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        <!-- AI Settings -->
        <div class="card">
          <div class="settings-section">
            <h3 class="settings-title">إعدادات الذكاء الاصطناعي</h3>
            
            <div class="form-group">
              <label class="form-label">مزود الخدمة</label>
              <select id="setting-provider" class="form-select" onchange="updateSetting('aiProvider', this.value)">
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="local">محلي</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">مفتاح API</label>
              <input type="password" id="setting-apikey" class="form-input" placeholder="sk-..." onchange="updateSetting('aiApiKey', this.value)">
            </div>

            <div class="form-group">
              <label class="form-label">النموذج</label>
              <select id="setting-model" class="form-select" onchange="updateSetting('aiModel', this.value)">
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <button class="btn btn-primary mt-4" onclick="saveSettings()">
        ${Icons.check} حفظ الإعدادات
      </button>
    </div>
  `;
}

function renderChatPanel() {
  const presets = [
    { id: 'gpu_help', label: 'حل مشكلة في أداء GPU' },
    { id: 'optimize', label: 'تحسين إعدادات الاستدلال' },
    { id: 'benchmark', label: 'تحليل نتائج الاختبار' },
    { id: 'guide', label: 'شرح واجهة التطبيق' }
  ];

  return `
    <div class="chat-header">
      <div class="chat-title">
        <div class="chat-icon">${Icons.robot}</div>
        <div>
          <div class="font-semibold">مساعد الذكاء</div>
          <div class="text-xs" style="color: var(--text-muted)">AI Assistant</div>
        </div>
      </div>
      <button class="chat-close-btn" onclick="toggleChat()">
        ${Icons.close}
      </button>
    </div>

    ${AppState.chatMessages.length === 0 ? `
      <div class="chat-presets">
        <p class="text-sm mb-3" style="color: var(--text-secondary);">اختر موضوعاً للبدء:</p>
        ${presets.map(p => `
          <button class="preset-btn" onclick="sendPresetMessage('${p.id}')">${p.label}</button>
        `).join('')}
      </div>
    ` : ''}

    <div class="chat-messages" id="chat-messages">
      ${AppState.chatMessages.map(msg => `
        <div class="chat-message ${msg.role}">
          ${msg.content}
        </div>
      `).join('')}
    </div>

    <div class="chat-input-area">
      <div class="chat-input-wrapper">
        <input type="text" id="chat-input" class="chat-input" placeholder="اكتب رسالتك..." 
          onkeypress="if(event.key==='Enter')sendChatMessage()">
        <button class="chat-send-btn" onclick="sendChatMessage()" id="chat-send-btn">
          ${Icons.send}
        </button>
      </div>
    </div>
  `;
}

// ============================================
// Actions
// ============================================
function navigateTo(page) {
  AppState.currentPage = page;
  render();
}

function toggleChat() {
  AppState.chatOpen = !AppState.chatOpen;
  const chatPanel = document.getElementById('chat-panel');
  if (AppState.chatOpen) {
    chatPanel.classList.remove('hidden');
    chatPanel.innerHTML = renderChatPanel();
  } else {
    chatPanel.classList.add('hidden');
  }
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const message = input?.value?.trim();
  if (!message) return;

  AppState.chatMessages.push({ role: 'user', content: message });
  input.value = '';
  renderChatMessages();

  const response = await API.sendChatMessage(message);
  AppState.chatMessages.push({ role: 'assistant', content: response.reply });
  renderChatMessages();
}

function sendPresetMessage(presetId) {
  const messages = {
    'gpu_help': 'أواجه مشكلة في أداء بطاقة الرسومات. هل يمكنك مساعدتي؟',
    'optimize': 'كيف يمكنني تحسين إعدادات الاستدلال للحصول على أفضل أداء؟',
    'benchmark': 'قم بتحليل نتائج اختبار الأداء الأخيرة واقترح تحسينات.',
    'guide': 'أنا مستخدم جديد، هل يمكنك شرح واجهة التطبيق؟'
  };
  
  const message = messages[presetId];
  if (message) {
    document.getElementById('chat-input').value = message;
    sendChatMessage();
  }
}

function renderChatMessages() {
  const container = document.getElementById('chat-messages');
  if (container) {
    container.innerHTML = AppState.chatMessages.map(msg => `
      <div class="chat-message ${msg.role}">
        ${msg.content}
      </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
  }
}

async function runInference() {
  const model = document.getElementById('inference-model')?.value;
  const precision = document.querySelector('#precision-group .radio-btn.active')?.dataset.value || 'FP16';
  const batchSize = parseInt(document.getElementById('inference-batch')?.value || '1');

  const resultsDiv = document.getElementById('inference-results');
  resultsDiv.innerHTML = '<div class="loader" style="margin: 40px auto;"></div>';

  const result = await API.runInference({ model, precision, batchSize });

  // Add to log
  const now = new Date().toLocaleTimeString('ar-SA');
  AppState.inferenceLog.unshift({
    time: now,
    message: `${model} | ${precision} | Batch ${batchSize} → ${result.latencyMs}ms`
  });
  if (AppState.inferenceLog.length > 10) AppState.inferenceLog.pop();

  resultsDiv.innerHTML = `
    <div class="grid grid-cols-2 gap-3">
      ${renderMetricCard('وقت الاستجابة', result.latencyMs, 'ms', 50, 'primary')}
      ${renderMetricCard('معدل الإنتاجية', result.throughput, 'img/s', 1000, 'success')}
      ${renderMetricCard('ذاكرة GPU', result.gpuMemoryMB, 'MB', 4000, 'warning')}
      ${renderMetricCard('الدقة', result.precision, '', 1, 'purple')}
    </div>
    <p class="text-xs mt-3" style="color: var(--text-muted); text-align: center;">
      ${result.isReal ? '✅ نتيجة حقيقية' : '⚠️ محاكاة'}
    </p>
  `;

  // Update log display
  const logDiv = document.getElementById('run-log');
  if (logDiv) {
    logDiv.innerHTML = AppState.inferenceLog.map(log => `
      <div class="log-entry">
        <span class="log-time">${log.time}</span>
        <span class="log-message">${log.message}</span>
      </div>
    `).join('');
  }
}

async function updateSetting(key, value) {
  await API.setSetting(key, value);
  AppState.settings[key] = value;
}

async function saveSettings() {
  alert('تم حفظ الإعدادات بنجاح!');
}

// ============================================
// Main Render
// ============================================
function render() {
  document.getElementById('sidebar').innerHTML = renderSidebar();
  document.getElementById('topbar').innerHTML = renderTopbar();
  
  const content = document.getElementById('page-content');
  switch (AppState.currentPage) {
    case 'dashboard':
      content.innerHTML = renderDashboard();
      break;
    case 'inference':
      content.innerHTML = renderInference();
      setupInferenceControls();
      break;
    case 'settings':
      content.innerHTML = renderSettings();
      break;
    default:
      content.innerHTML = renderDashboard();
  }
}

function setupInferenceControls() {
  // Setup radio buttons
  document.querySelectorAll('#precision-group .radio-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#precision-group .radio-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// ============================================
// Initialization
// ============================================
async function init() {
  // Listen for navigation events from Electron menu
  if (window.AIForgeAPI) {
    window.AIForgeAPI.onNavigate((page) => {
      AppState.currentPage = page;
      render();
    });
  }

  // Initial render
  render();

  // Start GPU monitoring
  await fetchGpuMetrics();
  setInterval(fetchGpuMetrics, 2000);
}

async function fetchGpuMetrics() {
  AppState.gpuMetrics = await API.getGpuMetrics();
  if (AppState.currentPage === 'dashboard') {
    document.getElementById('page-content').innerHTML = renderDashboard();
  }
  // Update sidebar status
  const subtitle = document.querySelector('.sidebar-subtitle');
  if (subtitle) {
    subtitle.textContent = AppState.gpuMetrics?.isReal ? '🟢 GPU متصل' : '🟡 وضع العرض';
  }
}

// Start app
document.addEventListener('DOMContentLoaded', init);
