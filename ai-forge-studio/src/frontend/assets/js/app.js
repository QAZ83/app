/**
 * AI Forge Studio - Main Application
 * Frontend JavaScript Application
 */

// State Management
const AppState = {
  currentPage: 'dashboard',
  gpuMetrics: null,
  settings: {},
  chatMessages: [],
  isChatOpen: false,
  isLoading: true,
  metricsInterval: null
};

// Icons (SVG)
const Icons = {
  dashboard: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
  gpu: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>',
  inference: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>',
  chat: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
  settings: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
  temperature: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>',
  memory: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"></path></svg>',
  power: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>',
  clock: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
  fan: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c-2-2.67-2-6.33 0-9 2.67 2 6.33 2 9 0-2 2.67-2 6.33 0 9-2.67-2-6.33-2-9 0 2-2.67 2-6.33 0-9-2.67 2-6.33 2-9 0"></path><circle cx="12" cy="12" r="2"></circle></svg>',
  search: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
  bell: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
  send: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
  close: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
  play: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
  activity: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',
  check: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  info: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
  sparkles: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>'
};

// Navigation items
const NavItems = [
  { id: 'dashboard', icon: 'dashboard', label: 'لوحة التحكم', section: 'main' },
  { id: 'gpu', icon: 'gpu', label: 'مراقبة GPU', section: 'main' },
  { id: 'inference', icon: 'inference', label: 'الاستدلال', section: 'main' },
  { id: 'chat', icon: 'chat', label: 'مساعد AI', section: 'tools' },
  { id: 'settings', icon: 'settings', label: 'الإعدادات', section: 'system' }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('AI Forge Studio Initializing...');
  
  try {
    // Load settings
    AppState.settings = await window.AIForgeAPI.getAllSettings();
    
    // Render UI
    renderSidebar();
    renderTopbar();
    renderChatPanel();
    
    // Navigate to dashboard
    navigateTo('dashboard');
    
    // Start metrics polling
    startMetricsPolling();
    
    // Listen for navigation events from menu
    window.AIForgeAPI.onNavigate((page) => {
      navigateTo(page);
    });
    
    AppState.isLoading = false;
    console.log('AI Forge Studio Ready');
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// Render Sidebar
function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainItems = NavItems.filter(i => i.section === 'main');
  const toolItems = NavItems.filter(i => i.section === 'tools');
  const systemItems = NavItems.filter(i => i.section === 'system');
  
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">${Icons.sparkles}</div>
      <div class="sidebar-title">
        <h1>AI Forge Studio</h1>
        <span>GPU Inference Suite</span>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-section-title">الرئيسية</div>
        ${mainItems.map(item => renderNavItem(item)).join('')}
      </div>
      
      <div class="nav-section">
        <div class="nav-section-title">الأدوات</div>
        ${toolItems.map(item => renderNavItem(item)).join('')}
      </div>
      
      <div class="nav-section">
        <div class="nav-section-title">النظام</div>
        ${systemItems.map(item => renderNavItem(item)).join('')}
      </div>
    </nav>
    
    <div class="sidebar-footer">
      <div class="gpu-status-mini">
        <div class="gpu-status-indicator"></div>
        <div class="gpu-status-text">
          <strong id="sidebar-gpu-name">جارٍ التحميل...</strong>
          <span id="sidebar-gpu-status">—</span>
        </div>
      </div>
    </div>
  `;
  
  // Add click handlers
  sidebar.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page === 'chat') {
        toggleChatPanel();
      } else {
        navigateTo(page);
      }
    });
  });
}

function renderNavItem(item) {
  return `
    <div class="nav-item ${AppState.currentPage === item.id ? 'active' : ''}" data-page="${item.id}">
      <span class="nav-item-icon">${Icons[item.icon]}</span>
      <span class="nav-item-text">${item.label}</span>
    </div>
  `;
}

// Render Topbar
function renderTopbar() {
  const topbar = document.getElementById('topbar');
  
  topbar.innerHTML = `
    <div class="topbar-left">
      <h2 class="page-title" id="page-title">لوحة التحكم</h2>
    </div>
    <div class="topbar-right">
      <div class="topbar-search">
        <span class="topbar-search-icon">${Icons.search}</span>
        <input type="text" placeholder="بحث..." />
      </div>
      <button class="topbar-btn" id="btn-notifications" title="الإشعارات">
        ${Icons.bell}
        <span class="notification-badge">3</span>
      </button>
      <button class="topbar-btn ${AppState.isChatOpen ? 'active' : ''}" id="btn-chat" title="مساعد AI">
        ${Icons.chat}
      </button>
    </div>
  `;
  
  document.getElementById('btn-chat').addEventListener('click', toggleChatPanel);
}

// Render Chat Panel
function renderChatPanel() {
  const chatPanel = document.getElementById('chat-panel');
  
  chatPanel.innerHTML = `
    <div class="chat-header">
      <span class="chat-title">
        <span class="chat-title-icon">${Icons.sparkles}</span>
        مساعد AI
      </span>
      <button class="btn btn-ghost btn-icon" id="close-chat">${Icons.close}</button>
    </div>
    
    <div class="chat-messages" id="chat-messages">
      <div class="chat-message assistant">
        مرحباً! أنا مساعدك الذكي في AI Forge Studio. كيف يمكنني مساعدتك اليوم؟ يمكنني المساعدة في:
        <br><br>
        • تحليل أداء GPU<br>
        • تحسين الاستدلال<br>
        • حل المشكلات التقنية
      </div>
    </div>
    
    <div class="chat-input-container">
      <div class="chat-input-wrapper">
        <input type="text" class="chat-input" id="chat-input" placeholder="اكتب رسالتك..." />
        <button class="chat-send-btn" id="chat-send">${Icons.send}</button>
      </div>
    </div>
  `;
  
  document.getElementById('close-chat').addEventListener('click', toggleChatPanel);
  document.getElementById('chat-send').addEventListener('click', sendChatMessage);
  document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });
}

// Toggle Chat Panel
function toggleChatPanel() {
  AppState.isChatOpen = !AppState.isChatOpen;
  const chatPanel = document.getElementById('chat-panel');
  const chatBtn = document.getElementById('btn-chat');
  
  if (AppState.isChatOpen) {
    chatPanel.classList.remove('hidden');
    chatPanel.classList.add('visible');
    chatBtn.classList.add('active');
  } else {
    chatPanel.classList.add('hidden');
    chatPanel.classList.remove('visible');
    chatBtn.classList.remove('active');
  }
}

// Send Chat Message
async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;
  
  // Clear input
  input.value = '';
  
  // Add user message
  addChatMessage(message, 'user');
  
  // Show typing indicator
  showTypingIndicator();
  
  try {
    const response = await window.AIForgeAPI.sendChatMessage({
      message: message,
      model: AppState.settings.aiModel || 'gpt-4o-mini'
    });
    
    // Remove typing indicator
    removeTypingIndicator();
    
    // Add assistant response
    addChatMessage(response.reply, 'assistant');
  } catch (error) {
    removeTypingIndicator();
    addChatMessage('عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.', 'assistant');
  }
}

function addChatMessage(text, type) {
  const messagesContainer = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${type}`;
  messageDiv.textContent = text;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
  const messagesContainer = document.getElementById('chat-messages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message assistant typing';
  typingDiv.id = 'typing-indicator';
  typingDiv.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
  const typing = document.getElementById('typing-indicator');
  if (typing) typing.remove();
}

// Navigation
function navigateTo(page) {
  AppState.currentPage = page;
  
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  
  // Update page title
  const pageTitle = document.getElementById('page-title');
  const pageTitles = {
    dashboard: 'لوحة التحكم',
    gpu: 'مراقبة GPU',
    inference: 'الاستدلال',
    settings: 'الإعدادات'
  };
  pageTitle.textContent = pageTitles[page] || page;
  
  // Render page content
  const pageContent = document.getElementById('page-content');
  
  switch(page) {
    case 'dashboard':
      renderDashboard(pageContent);
      break;
    case 'gpu':
      renderGpuPage(pageContent);
      break;
    case 'inference':
      renderInferencePage(pageContent);
      break;
    case 'settings':
      renderSettingsPage(pageContent);
      break;
    default:
      pageContent.innerHTML = '<div class="empty-state"><p>الصفحة غير موجودة</p></div>';
  }
}

// Render Dashboard
function renderDashboard(container) {
  const metrics = AppState.gpuMetrics || {};
  
  container.innerHTML = `
    <div class="grid grid-cols-4 gap-4 mb-4">
      <div class="card metric-card">
        <div class="metric-icon">${Icons.activity}</div>
        <div class="metric-label">استخدام GPU</div>
        <div class="metric-value">${metrics.utilization || 0}<span class="metric-unit">%</span></div>
        <div class="progress-bar mt-2">
          <div class="progress-fill gradient" style="width: ${metrics.utilization || 0}%"></div>
        </div>
      </div>
      
      <div class="card metric-card">
        <div class="metric-icon">${Icons.temperature}</div>
        <div class="metric-label">درجة الحرارة</div>
        <div class="metric-value">${metrics.temperature || 0}<span class="metric-unit">°C</span></div>
        <div class="progress-bar mt-2">
          <div class="progress-fill ${getTemperatureColor(metrics.temperature)}" style="width: ${(metrics.temperature || 0) / 100 * 100}%"></div>
        </div>
      </div>
      
      <div class="card metric-card">
        <div class="metric-icon">${Icons.memory}</div>
        <div class="metric-label">ذاكرة VRAM</div>
        <div class="metric-value">${formatMemory(metrics.memoryUsed)}<span class="metric-unit">/${formatMemory(metrics.memoryTotal)}</span></div>
        <div class="progress-bar mt-2">
          <div class="progress-fill gradient" style="width: ${getMemoryPercent(metrics)}%"></div>
        </div>
      </div>
      
      <div class="card metric-card">
        <div class="metric-icon">${Icons.power}</div>
        <div class="metric-label">استهلاك الطاقة</div>
        <div class="metric-value">${metrics.powerDraw || 0}<span class="metric-unit">W</span></div>
        <div class="progress-bar mt-2">
          <div class="progress-fill warning" style="width: ${((metrics.powerDraw || 0) / (metrics.powerLimit || 450)) * 100}%"></div>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-3 gap-4">
      <div class="card col-span-2">
        <div class="card-header">
          <h3 class="card-title">
            <span class="card-title-icon">${Icons.gpu}</span>
            معلومات GPU
          </h3>
          <span class="status-badge ${metrics.isReal ? 'online' : 'warning'}">
            <span class="status-dot"></span>
            ${metrics.isReal ? 'متصل' : 'محاكاة'}
          </span>
        </div>
        <div class="gpu-info-grid">
          <div class="info-row">
            <span class="info-label">اسم GPU</span>
            <span class="info-value" id="gpu-name">${metrics.name || 'غير معروف'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">المصنع</span>
            <span class="info-value">${metrics.vendor || 'غير معروف'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">برنامج التشغيل</span>
            <span class="info-value">${metrics.driver || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">تردد النواة</span>
            <span class="info-value">${metrics.clockCore || 0} MHz</span>
          </div>
          <div class="info-row">
            <span class="info-label">تردد الذاكرة</span>
            <span class="info-value">${metrics.clockMemory || 0} MHz</span>
          </div>
          <div class="info-row">
            <span class="info-label">PCIe</span>
            <span class="info-value">Gen ${metrics.pcieGen || 4} x${metrics.pcieWidth || 16}</span>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <span class="card-title-icon">${Icons.fan}</span>
            التبريد
          </h3>
        </div>
        <div class="fan-display">
          <div class="fan-icon ${metrics.fanSpeed > 50 ? 'fast' : ''}">${Icons.fan}</div>
          <div class="fan-speed">${metrics.fanSpeed || 0}%</div>
          <div class="fan-label">سرعة المروحة</div>
        </div>
        <div class="progress-bar mt-4">
          <div class="progress-fill gradient" style="width: ${metrics.fanSpeed || 0}%"></div>
        </div>
      </div>
    </div>
    
    <style>
      .gpu-info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--border-color);
      }
      .info-label {
        color: var(--text-muted);
        font-size: 0.875rem;
      }
      .info-value {
        color: var(--text-primary);
        font-weight: 500;
        font-size: 0.875rem;
      }
      .fan-display {
        text-align: center;
        padding: 1.5rem 0;
      }
      .fan-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--accent-primary);
      }
      .fan-icon svg {
        width: 48px;
        height: 48px;
      }
      .fan-icon.fast svg {
        animation: spin 1s linear infinite;
      }
      .fan-speed {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .fan-label {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 0.25rem;
      }
    </style>
  `;
  
  // Update sidebar GPU info
  document.getElementById('sidebar-gpu-name').textContent = metrics.name || 'جارٍ التحميل...';
  document.getElementById('sidebar-gpu-status').textContent = `${metrics.temperature || 0}°C • ${metrics.utilization || 0}%`;
}

// Render GPU Page
function renderGpuPage(container) {
  const metrics = AppState.gpuMetrics || {};
  
  container.innerHTML = `
    <div class="card mb-4">
      <div class="card-header">
        <h3 class="card-title">
          <span class="card-title-icon">${Icons.gpu}</span>
          ${metrics.name || 'GPU'}
        </h3>
        <span class="status-badge ${metrics.isReal ? 'online' : 'warning'}">
          <span class="status-dot"></span>
          ${metrics.isReal ? 'بيانات حقيقية' : 'محاكاة'}
        </span>
      </div>
      
      <div class="grid grid-cols-3 gap-4 mt-4">
        <div class="metric-mini">
          <span class="metric-mini-label">الاستخدام</span>
          <span class="metric-mini-value">${metrics.utilization || 0}%</span>
          <div class="progress-bar mt-1">
            <div class="progress-fill gradient" style="width: ${metrics.utilization || 0}%"></div>
          </div>
        </div>
        
        <div class="metric-mini">
          <span class="metric-mini-label">الحرارة</span>
          <span class="metric-mini-value">${metrics.temperature || 0}°C</span>
          <div class="progress-bar mt-1">
            <div class="progress-fill ${getTemperatureColor(metrics.temperature)}" style="width: ${metrics.temperature || 0}%"></div>
          </div>
        </div>
        
        <div class="metric-mini">
          <span class="metric-mini-label">VRAM</span>
          <span class="metric-mini-value">${formatMemory(metrics.memoryUsed)} / ${formatMemory(metrics.memoryTotal)}</span>
          <div class="progress-bar mt-1">
            <div class="progress-fill gradient" style="width: ${getMemoryPercent(metrics)}%"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <div class="card">
        <h4 class="card-title mb-4">
          <span class="card-title-icon">${Icons.clock}</span>
          الترددات
        </h4>
        <div class="stats-list">
          <div class="stat-item">
            <span>تردد النواة</span>
            <strong>${metrics.clockCore || 0} MHz</strong>
          </div>
          <div class="stat-item">
            <span>تردد الذاكرة</span>
            <strong>${metrics.clockMemory || 0} MHz</strong>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h4 class="card-title mb-4">
          <span class="card-title-icon">${Icons.power}</span>
          الطاقة
        </h4>
        <div class="stats-list">
          <div class="stat-item">
            <span>الاستهلاك الحالي</span>
            <strong>${metrics.powerDraw || 0} W</strong>
          </div>
          <div class="stat-item">
            <span>الحد الأقصى</span>
            <strong>${metrics.powerLimit || 0} W</strong>
          </div>
        </div>
      </div>
    </div>
    
    <style>
      .metric-mini {
        padding: 1rem;
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
      }
      .metric-mini-label {
        display: block;
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-bottom: 0.25rem;
      }
      .metric-mini-value {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      .stats-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .stat-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem;
        background: var(--bg-tertiary);
        border-radius: var(--radius-sm);
      }
      .stat-item span {
        color: var(--text-muted);
      }
      .stat-item strong {
        color: var(--text-primary);
      }
    </style>
  `;
}

// Render Inference Page
function renderInferencePage(container) {
  container.innerHTML = `
    <div class="grid grid-cols-3 gap-4">
      <div class="card col-span-2">
        <div class="card-header">
          <h3 class="card-title">
            <span class="card-title-icon">${Icons.inference}</span>
            تشغيل الاستدلال
          </h3>
        </div>
        
        <div class="form-group">
          <label class="form-label">اختر النموذج</label>
          <select class="form-select" id="inference-model">
            <option value="ResNet-50">ResNet-50 (تصنيف الصور)</option>
            <option value="YOLOv8">YOLOv8 (كشف الكائنات)</option>
            <option value="BERT">BERT (معالجة اللغة)</option>
            <option value="GPT-2">GPT-2 (توليد النص)</option>
            <option value="Stable Diffusion">Stable Diffusion (توليد الصور)</option>
          </select>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">الدقة</label>
            <select class="form-select" id="inference-precision">
              <option value="FP32">FP32 (دقة كاملة)</option>
              <option value="FP16" selected>FP16 (نصف الدقة)</option>
              <option value="INT8">INT8 (كمي)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">حجم الدفعة</label>
            <select class="form-select" id="inference-batch">
              <option value="1">1</option>
              <option value="4">4</option>
              <option value="8" selected>8</option>
              <option value="16">16</option>
              <option value="32">32</option>
            </select>
          </div>
        </div>
        
        <button class="btn btn-primary w-full mt-4" id="run-inference">
          ${Icons.play}
          تشغيل الاستدلال
        </button>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <span class="card-title-icon">${Icons.activity}</span>
            النتائج
          </h3>
        </div>
        
        <div id="inference-results" class="empty-state">
          <div class="empty-state-icon">${Icons.inference}</div>
          <p class="empty-state-text">قم بتشغيل استدلال لرؤية النتائج</p>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('run-inference').addEventListener('click', runInference);
}

async function runInference() {
  const model = document.getElementById('inference-model').value;
  const precision = document.getElementById('inference-precision').value;
  const batchSize = parseInt(document.getElementById('inference-batch').value);
  const resultsDiv = document.getElementById('inference-results');
  
  resultsDiv.innerHTML = '<div class="loading-spinner" style="margin: 2rem auto;"></div>';
  
  try {
    const result = await window.AIForgeAPI.runInference({
      model,
      precision,
      batchSize
    });
    
    resultsDiv.innerHTML = `
      <div class="result-item">
        <span class="result-label">النموذج</span>
        <span class="result-value">${result.model}</span>
      </div>
      <div class="result-item">
        <span class="result-label">زمن الاستجابة</span>
        <span class="result-value text-accent">${result.latencyMs} ms</span>
      </div>
      <div class="result-item">
        <span class="result-label">الإنتاجية</span>
        <span class="result-value text-success">${result.throughput} img/s</span>
      </div>
      <div class="result-item">
        <span class="result-label">ذاكرة GPU</span>
        <span class="result-value">${result.gpuMemoryMB} MB</span>
      </div>
      ${!result.isReal ? '<p class="text-warning text-xs mt-4">* نتائج محاكاة</p>' : ''}
      
      <style>
        .result-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        .result-label {
          color: var(--text-muted);
        }
        .result-value {
          font-weight: 600;
        }
      </style>
    `;
  } catch (error) {
    resultsDiv.innerHTML = '<p class="text-danger">حدث خطأ أثناء تشغيل الاستدلال</p>';
  }
}

// Render Settings Page
function renderSettingsPage(container) {
  const settings = AppState.settings;
  
  container.innerHTML = `
    <div class="grid grid-cols-2 gap-4">
      <div class="card">
        <h3 class="card-title mb-4">
          <span class="card-title-icon">${Icons.settings}</span>
          إعدادات عامة
        </h3>
        
        <div class="form-group">
          <label class="form-label">فترة التحديث (مللي ثانية)</label>
          <select class="form-select" id="setting-refresh">
            <option value="1000" ${settings.refreshInterval === 1000 ? 'selected' : ''}>1000 (سريع)</option>
            <option value="2000" ${settings.refreshInterval === 2000 ? 'selected' : ''}>2000 (عادي)</option>
            <option value="5000" ${settings.refreshInterval === 5000 ? 'selected' : ''}>5000 (بطيء)</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">وضع الأداء</label>
          <select class="form-select" id="setting-performance">
            <option value="power-saver" ${settings.performanceMode === 'power-saver' ? 'selected' : ''}>توفير الطاقة</option>
            <option value="balanced" ${settings.performanceMode === 'balanced' ? 'selected' : ''}>متوازن</option>
            <option value="performance" ${settings.performanceMode === 'performance' ? 'selected' : ''}>أداء عالي</option>
          </select>
        </div>
      </div>
      
      <div class="card">
        <h3 class="card-title mb-4">
          <span class="card-title-icon">${Icons.sparkles}</span>
          إعدادات AI
        </h3>
        
        <div class="form-group">
          <label class="form-label">مزود AI</label>
          <select class="form-select" id="setting-ai-provider">
            <option value="openai" ${settings.aiProvider === 'openai' ? 'selected' : ''}>OpenAI</option>
            <option value="anthropic" ${settings.aiProvider === 'anthropic' ? 'selected' : ''}>Anthropic (Claude)</option>
            <option value="gemini" ${settings.aiProvider === 'gemini' ? 'selected' : ''}>Google (Gemini)</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">النموذج</label>
          <select class="form-select" id="setting-ai-model">
            <option value="gpt-4o-mini" ${settings.aiModel === 'gpt-4o-mini' ? 'selected' : ''}>GPT-4o Mini</option>
            <option value="gpt-4o" ${settings.aiModel === 'gpt-4o' ? 'selected' : ''}>GPT-4o</option>
            <option value="gpt-5.1" ${settings.aiModel === 'gpt-5.1' ? 'selected' : ''}>GPT-5.1</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">مفتاح API</label>
          <input type="password" class="form-input" id="setting-api-key" 
                 placeholder="sk-..." value="${settings.aiApiKey || ''}" />
        </div>
      </div>
    </div>
    
    <div class="mt-4">
      <button class="btn btn-primary" id="save-settings">
        ${Icons.check}
        حفظ الإعدادات
      </button>
    </div>
  `;
  
  document.getElementById('save-settings').addEventListener('click', saveSettings);
}

async function saveSettings() {
  const refreshInterval = parseInt(document.getElementById('setting-refresh').value);
  const performanceMode = document.getElementById('setting-performance').value;
  const aiProvider = document.getElementById('setting-ai-provider').value;
  const aiModel = document.getElementById('setting-ai-model').value;
  const aiApiKey = document.getElementById('setting-api-key').value;
  
  try {
    await window.AIForgeAPI.setSetting('refreshInterval', refreshInterval);
    await window.AIForgeAPI.setSetting('performanceMode', performanceMode);
    await window.AIForgeAPI.setSetting('aiProvider', aiProvider);
    await window.AIForgeAPI.setSetting('aiModel', aiModel);
    await window.AIForgeAPI.setSetting('aiApiKey', aiApiKey);
    
    AppState.settings = await window.AIForgeAPI.getAllSettings();
    
    // Restart metrics polling with new interval
    startMetricsPolling();
    
    alert('تم حفظ الإعدادات بنجاح!');
  } catch (error) {
    alert('حدث خطأ أثناء حفظ الإعدادات');
  }
}

// Helper Functions
function formatMemory(mb) {
  if (!mb) return '0';
  if (mb >= 1024) {
    return (mb / 1024).toFixed(1) + ' GB';
  }
  return mb + ' MB';
}

function getMemoryPercent(metrics) {
  if (!metrics.memoryTotal) return 0;
  return ((metrics.memoryUsed || 0) / metrics.memoryTotal * 100).toFixed(0);
}

function getTemperatureColor(temp) {
  if (!temp) return 'success';
  if (temp < 60) return 'success';
  if (temp < 80) return 'warning';
  return 'danger';
}

// Metrics Polling
function startMetricsPolling() {
  if (AppState.metricsInterval) {
    clearInterval(AppState.metricsInterval);
  }
  
  const fetchMetrics = async () => {
    try {
      AppState.gpuMetrics = await window.AIForgeAPI.getGpuMetrics();
      
      // Update dashboard if on that page
      if (AppState.currentPage === 'dashboard') {
        renderDashboard(document.getElementById('page-content'));
      } else if (AppState.currentPage === 'gpu') {
        renderGpuPage(document.getElementById('page-content'));
      }
    } catch (error) {
      console.error('Failed to fetch GPU metrics:', error);
    }
  };
  
  fetchMetrics();
  const interval = AppState.settings.refreshInterval || 2000;
  AppState.metricsInterval = setInterval(fetchMetrics, interval);
}
