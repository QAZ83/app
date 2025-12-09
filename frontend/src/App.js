import React, { useState, useEffect, useCallback } from "react";
import "@/App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ==================== Icons Components ====================
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Benchmark: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Inference: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Chat: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  GPU: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  Send: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Loader: () => (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  Expand: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  ),
  Minimize: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  )
};

// ==================== Sidebar Component ====================
const Sidebar = ({ activePage, setActivePage, setChatOpen }) => {
  const menuItems = [
    { id: 'dashboard', icon: Icons.Dashboard, label: 'لوحة التحكم', labelEn: 'Dashboard' },
    { id: 'benchmarks', icon: Icons.Benchmark, label: 'اختبارات الأداء', labelEn: 'Benchmarks' },
    { id: 'inference', icon: Icons.Inference, label: 'الاستدلال', labelEn: 'Inference' },
    { id: 'settings', icon: Icons.Settings, label: 'الإعدادات', labelEn: 'Settings' },
  ];

  return (
    <div className="w-64 bg-gray-900/50 backdrop-blur-xl border-r border-cyan-500/20 flex flex-col" data-testid="sidebar">
      {/* Logo */}
      <div className="p-6 border-b border-cyan-500/20">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          AI Forge Studio
        </h1>
        <p className="text-xs text-gray-500 mt-1">RTX 5090 Powered</p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              data-testid={`nav-${item.id}`}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                activePage === item.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <IconComponent />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* AI Assistant Button */}
      <div className="p-4 border-t border-cyan-500/20">
        <button
          data-testid="ai-assistant-btn"
          onClick={() => setChatOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
        >
          <Icons.Chat />
          <span>مساعد الذكاء</span>
        </button>
      </div>
    </div>
  );
};

// ==================== Dashboard Component ====================
const Dashboard = ({ gpuInfo }) => {
  const stats = [
    { label: 'درجة الحرارة', value: gpuInfo?.temperature || 0, unit: '°C', color: 'cyan', max: 100 },
    { label: 'استخدام GPU', value: gpuInfo?.utilization || 0, unit: '%', color: 'green', max: 100 },
    { label: 'استهلاك الطاقة', value: gpuInfo?.power_usage || 0, unit: 'W', color: 'yellow', max: 500 },
    { label: 'سرعة الساعة', value: gpuInfo?.clock_speed || 0, unit: 'MHz', color: 'purple', max: 3000 },
  ];

  const colorClasses = {
    cyan: 'from-cyan-500 to-cyan-400',
    green: 'from-green-500 to-green-400',
    yellow: 'from-yellow-500 to-yellow-400',
    purple: 'from-purple-500 to-purple-400',
  };

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">لوحة التحكم</h2>
          <p className="text-gray-400 mt-1">مراقبة أداء بطاقة الرسومات في الوقت الفعلي</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-green-400 text-sm">متصل</span>
        </div>
      </div>

      {/* GPU Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-cyan-500/20 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5"></div>
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
              <Icons.GPU />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{gpuInfo?.name || 'Loading...'}</h3>
              <p className="text-gray-400 text-sm">Driver: {gpuInfo?.driver_version} | CUDA: {gpuInfo?.cuda_version}</p>
            </div>
          </div>

          {/* Memory Info */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">الذاكرة</span>
              <span className="text-cyan-400">{gpuInfo?.memory_used?.toFixed(1)} / {gpuInfo?.memory_total} GB</span>
            </div>
            <div className="h-3 rounded-full bg-gray-700/50 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${((gpuInfo?.memory_used || 0) / (gpuInfo?.memory_total || 32)) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="p-4 rounded-xl bg-black/30 border border-white/5">
                <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                <p className={`text-2xl font-bold bg-gradient-to-r ${colorClasses[stat.color]} bg-clip-text text-transparent`}>
                  {typeof stat.value === 'number' ? stat.value.toFixed(1) : stat.value}{stat.unit}
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-gray-700/50 overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${colorClasses[stat.color]} transition-all duration-500`}
                    style={{ width: `${(stat.value / stat.max) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'CUDA Benchmark', desc: 'اختبار أداء CUDA', color: 'green' },
          { title: 'TensorRT Test', desc: 'اختبار TensorRT', color: 'blue' },
          { title: 'Vulkan Render', desc: 'اختبار Vulkan', color: 'purple' },
        ].map((item, i) => (
          <div key={i} className="p-5 rounded-xl bg-gray-900/50 border border-white/5 hover:border-cyan-500/30 transition-colors cursor-pointer group">
            <h4 className="text-white font-semibold group-hover:text-cyan-400 transition-colors">{item.title}</h4>
            <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== Benchmarks Component ====================
const Benchmarks = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [history, setHistory] = useState([]);

  const benchmarkTypes = [
    { id: 'cuda', name: 'CUDA', desc: 'اختبار أداء CUDA المتوازي', color: 'green', gradient: 'from-green-500 to-emerald-500' },
    { id: 'tensorrt', name: 'TensorRT', desc: 'اختبار تسريع الاستدلال', color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'vulkan', name: 'Vulkan', desc: 'اختبار رسومات Vulkan', color: 'purple', gradient: 'from-purple-500 to-pink-500' },
    { id: 'general', name: 'General', desc: 'اختبار شامل', color: 'yellow', gradient: 'from-yellow-500 to-orange-500' },
  ];

  const runBenchmark = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const response = await axios.post(`${API}/benchmark/${type}`);
      setResults(prev => ({ ...prev, [type]: response.data }));
      fetchHistory();
    } catch (error) {
      console.error('Benchmark error:', error);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/benchmark/history?limit=10`);
      setHistory(response.data);
    } catch (error) {
      console.error('History fetch error:', error);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="space-y-6" data-testid="benchmarks-page">
      <div>
        <h2 className="text-3xl font-bold text-white">اختبارات الأداء</h2>
        <p className="text-gray-400 mt-1">قياس أداء بطاقة RTX 5090 في مختلف السيناريوهات</p>
      </div>

      {/* Benchmark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {benchmarkTypes.map((bench) => (
          <div key={bench.id} className="relative overflow-hidden rounded-xl bg-gray-900/50 border border-white/10 p-6">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${bench.gradient}`}></div>
            
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{bench.name}</h3>
                <p className="text-gray-400 text-sm">{bench.desc}</p>
              </div>
              <button
                data-testid={`run-${bench.id}-benchmark`}
                onClick={() => runBenchmark(bench.id)}
                disabled={loading[bench.id]}
                className={`px-4 py-2 rounded-lg bg-gradient-to-r ${bench.gradient} text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50`}
              >
                {loading[bench.id] ? (
                  <div className="flex items-center gap-2">
                    <Icons.Loader />
                    <span>جاري...</span>
                  </div>
                ) : 'تشغيل'}
              </button>
            </div>

            {results[bench.id] && (
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400">{results[bench.id].score?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">النتيجة</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{results[bench.id].fps}</p>
                  <p className="text-xs text-gray-500">FPS</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{results[bench.id].temperature}°</p>
                  <p className="text-xs text-gray-500">الحرارة</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-xl bg-gray-900/50 border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">سجل الاختبارات</h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-4 rounded-lg bg-black/20">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-cyan-500/20 text-cyan-400 uppercase">
                    {item.benchmark_type}
                  </span>
                  <span className="text-white font-medium">{item.score?.toLocaleString()}</span>
                </div>
                <span className="text-gray-500 text-sm">
                  {new Date(item.timestamp).toLocaleString('ar-SA')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Inference Component ====================
const Inference = () => {
  const [config, setConfig] = useState({
    model_name: 'ResNet50',
    batch_size: 1,
    precision: 'FP16',
    framework: 'TensorRT'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const models = ['ResNet50', 'ResNet101', 'VGG16', 'YOLO', 'Transformer', 'GPT-2', 'BERT', 'EfficientNet'];
  const precisions = ['FP32', 'FP16', 'INT8'];
  const frameworks = ['TensorRT', 'CUDA', 'ONNX'];

  const runInference = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/inference/run`, config);
      setResult(response.data);
      fetchHistory();
    } catch (error) {
      console.error('Inference error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/inference/history?limit=5`);
      setHistory(response.data);
    } catch (error) {
      console.error('History fetch error:', error);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="space-y-6" data-testid="inference-page">
      <div>
        <h2 className="text-3xl font-bold text-white">الاستدلال</h2>
        <p className="text-gray-400 mt-1">تشغيل نماذج الذكاء الاصطناعي باستخدام TensorRT</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="rounded-xl bg-gray-900/50 border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">إعدادات الاستدلال</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">النموذج</label>
              <select 
                data-testid="model-select"
                value={config.model_name}
                onChange={(e) => setConfig({ ...config, model_name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
              >
                {models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">حجم الدفعة</label>
              <input 
                type="number"
                data-testid="batch-size-input"
                value={config.batch_size}
                onChange={(e) => setConfig({ ...config, batch_size: parseInt(e.target.value) || 1 })}
                min="1"
                max="64"
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">الدقة</label>
              <div className="flex gap-2">
                {precisions.map(p => (
                  <button
                    key={p}
                    onClick={() => setConfig({ ...config, precision: p })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      config.precision === p
                        ? 'bg-cyan-500 text-white'
                        : 'bg-black/30 text-gray-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">الإطار</label>
              <div className="flex gap-2">
                {frameworks.map(f => (
                  <button
                    key={f}
                    onClick={() => setConfig({ ...config, framework: f })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      config.framework === f
                        ? 'bg-purple-500 text-white'
                        : 'bg-black/30 text-gray-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <button
              data-testid="run-inference-btn"
              onClick={runInference}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Icons.Loader />
                  <span>جاري التشغيل...</span>
                </div>
              ) : 'تشغيل الاستدلال'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-xl bg-gray-900/50 border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">النتائج</h3>
          
          {result ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-black/30">
                  <p className="text-gray-400 text-sm">وقت الاستجابة</p>
                  <p className="text-2xl font-bold text-cyan-400">{result.latency_ms} ms</p>
                </div>
                <div className="p-4 rounded-lg bg-black/30">
                  <p className="text-gray-400 text-sm">معدل الإنتاجية</p>
                  <p className="text-2xl font-bold text-green-400">{result.throughput} img/s</p>
                </div>
                <div className="p-4 rounded-lg bg-black/30">
                  <p className="text-gray-400 text-sm">الذاكرة المستخدمة</p>
                  <p className="text-2xl font-bold text-purple-400">{result.memory_allocated} MB</p>
                </div>
                <div className="p-4 rounded-lg bg-black/30">
                  <p className="text-gray-400 text-sm">الإطار</p>
                  <p className="text-2xl font-bold text-yellow-400">{result.framework}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              قم بتشغيل استدلال لرؤية النتائج
            </div>
          )}

          {/* Recent History */}
          {history.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/5">
              <h4 className="text-sm text-gray-400 mb-3">السجل الأخير</h4>
              <div className="space-y-2">
                {history.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-white">{item.model_name}</span>
                    <span className="text-cyan-400">{item.latency_ms}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== Settings Component ====================
const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Settings fetch error:', error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/settings`, settings);
      setMessage('تم حفظ الإعدادات بنجاح');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="settings-page">
      <div>
        <h2 className="text-3xl font-bold text-white">الإعدادات</h2>
        <p className="text-gray-400 mt-1">تخصيص إعدادات التطبيق</p>
      </div>

      {message && (
        <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="rounded-xl bg-gray-900/50 border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">الإعدادات العامة</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">مجلد النماذج</label>
              <input 
                type="text"
                data-testid="models-directory-input"
                value={settings.models_directory || ''}
                onChange={(e) => setSettings({ ...settings, models_directory: e.target.value })}
                placeholder="C:\Models"
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">دقة العرض</label>
              <select 
                value={settings.display_resolution || '1920x1080'}
                onChange={(e) => setSettings({ ...settings, display_resolution: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="1920x1080">1920x1080 (FHD)</option>
                <option value="2560x1440">2560x1440 (QHD)</option>
                <option value="3840x2160">3840x2160 (4K)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">تأثيرات GPU</span>
              <button
                onClick={() => setSettings({ ...settings, enable_gpu_animations: !settings.enable_gpu_animations })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.enable_gpu_animations ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.enable_gpu_animations ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* AI Settings */}
        <div className="rounded-xl bg-gray-900/50 border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">إعدادات الذكاء الاصطناعي</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">مزود الخدمة</label>
              <select 
                value={settings.ai_provider || 'openai'}
                onChange={(e) => setSettings({ ...settings, ai_provider: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="gemini">Google (Gemini)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">النموذج الافتراضي</label>
              <select 
                value={settings.default_ai_model || 'gpt-4o-mini'}
                onChange={(e) => setSettings({ ...settings, default_ai_model: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-5">GPT-5</option>
                <option value="claude-4-sonnet">Claude 4 Sonnet</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">اللغة</label>
              <select 
                value={settings.language || 'ar'}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <button
        data-testid="save-settings-btn"
        onClick={saveSettings}
        disabled={saving}
        className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
      </button>
    </div>
  );
};

// ==================== AI Chat Panel ====================
const AIAssistant = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [presets, setPresets] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      fetchPresets();
    }
  }, [isOpen]);

  const fetchPresets = async () => {
    try {
      const response = await axios.get(`${API}/chat/presets`);
      setPresets(response.data.presets);
    } catch (error) {
      console.error('Presets fetch error:', error);
    }
  };

  const sendMessage = async (text, preset = null) => {
    if (!text.trim() && !preset) return;
    
    const userMessage = { role: 'user', content: text || preset };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: text,
        session_id: sessionId,
        preset: preset
      });
      
      setSessionId(response.data.session_id);
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'عذراً، حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetId) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      sendMessage('', presetId);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      data-testid="ai-assistant-panel"
      className={`fixed right-0 top-0 h-full bg-gray-900/95 backdrop-blur-xl border-l border-cyan-500/20 flex flex-col transition-all duration-300 z-50 ${
        isExpanded ? 'w-full md:w-2/3' : 'w-full md:w-96'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Icons.Chat />
          </div>
          <div>
            <h3 className="font-semibold text-white">مساعد الذكاء</h3>
            <p className="text-xs text-gray-500">AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? <Icons.Minimize /> : <Icons.Expand />}
          </button>
          <button 
            data-testid="close-chat-btn"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <Icons.Close />
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      {messages.length === 0 && (
        <div className="p-4 border-b border-white/5">
          <p className="text-sm text-gray-400 mb-3">اختر موضوعاً للبدء:</p>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                data-testid={`preset-${preset.id}`}
                onClick={() => handlePresetClick(preset.id)}
                className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:border-cyan-500/30 transition-all text-right"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-3 rounded-xl ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                : 'bg-white/10 text-gray-200'
            }`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Icons.Loader />
                <span className="text-gray-400 text-sm">جاري الكتابة...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-cyan-500/20">
        <div className="flex gap-2">
          <input
            data-testid="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage(input)}
            placeholder="اكتب رسالتك..."
            className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
          />
          <button
            data-testid="send-message-btn"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Icons.Send />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== Main App ====================
function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [chatOpen, setChatOpen] = useState(false);
  const [gpuInfo, setGpuInfo] = useState(null);

  const fetchGpuInfo = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/gpu/info`);
      setGpuInfo(response.data);
    } catch (error) {
      console.error('GPU info fetch error:', error);
    }
  }, []);

  useEffect(() => {
    fetchGpuInfo();
    const interval = setInterval(fetchGpuInfo, 5000);
    return () => clearInterval(interval);
  }, [fetchGpuInfo]);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard gpuInfo={gpuInfo} />;
      case 'benchmarks':
        return <Benchmarks />;
      case 'inference':
        return <Inference />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard gpuInfo={gpuInfo} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex" dir="rtl">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage}
        setChatOpen={setChatOpen}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="p-8">
          {renderPage()}
        </div>
      </main>

      {/* AI Assistant Panel */}
      <AIAssistant isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

export default App;
