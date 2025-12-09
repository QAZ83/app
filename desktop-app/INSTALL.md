# 🚀 AI Forge Studio - Desktop Application
## دليل التثبيت والتشغيل

---

## 📋 المتطلبات

### الأساسية:
- **Windows 10/11** (64-bit)
- **Python 3.10+**
- **Node.js 18+**
- **NVIDIA GPU** (RTX 20xx أو أحدث)

### للميزات المتقدمة:
- **NVIDIA Driver** 535+ (لقراءة GPU)
- **CUDA Toolkit 12.x** (للـ Benchmarks)
- **cuDNN 8.x** (للـ Inference)
- **TensorRT 8.x** (Optional - لتسريع إضافي)

---

## 📥 خطوات التثبيت

### 1️⃣ تثبيت NVIDIA Driver
```bash
# تحقق من إصدار التعريف
nvidia-smi

# إذا كان الإصدار أقدم من 535، حدثه من:
# https://www.nvidia.com/Download/index.aspx
```

### 2️⃣ تثبيت CUDA Toolkit
```bash
# تنزيل CUDA 12.x من:
# https://developer.nvidia.com/cuda-downloads

# بعد التثبيت، تحقق:
nvcc --version
```

### 3️⃣ تثبيت Python Dependencies
```bash
cd backend

# إنشاء بيئة افتراضية (مستحسن)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# تثبيت المكتبات الأساسية
pip install fastapi uvicorn pydantic python-dotenv

# تثبيت مراقبة GPU
pip install pynvml

# تثبيت CUDA Computing (حسب إصدار CUDA)
pip install cupy-cuda12x  # لـ CUDA 12.x
# pip install cupy-cuda11x  # لـ CUDA 11.x

# تثبيت AI Inference
pip install onnxruntime-gpu  # لـ GPU
# pip install onnxruntime  # للـ CPU فقط

# تثبيت مساعد AI (اختياري)
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
```

### 4️⃣ تثبيت Electron Dependencies
```bash
cd ..
npm install
# أو
yarn install
```

---

## ▶️ التشغيل

### وضع التطوير:
```bash
# تشغيل الـ Backend منفصلاً
cd backend
python -m uvicorn server:app --host 127.0.0.1 --port 8080 --reload

# في terminal آخر، تشغيل Electron
npm run dev
```

### وضع الإنتاج:
```bash
npm start
```

---

## 📦 بناء ملف .exe

### بناء لـ Windows:
```bash
npm run build:win
```

### الملفات الناتجة:
- `dist/AI Forge Studio-2.0.0-x64.exe` - ملف التثبيت (NSIS)
- `dist/AI Forge Studio-2.0.0-x64.portable.exe` - نسخة محمولة

---

## 📁 هيكل المشروع

```
ai-forge-studio/
├── package.json          # Electron config
├── main.js               # Electron main process
├── preload.js            # Electron preload script
├── backend/              # Python FastAPI backend
│   ├── server.py         # Main API server
│   ├── gpu_monitor.py    # GPU monitoring (pynvml)
│   ├── benchmarks.py     # CUDA benchmarks
│   ├── inference.py      # AI inference
│   └── requirements.txt
├── renderer/             # React frontend
│   ├── src/
│   └── index.html
├── assets/               # Icons, images
└── models/               # ONNX models directory
```

---

## 🔧 الإعدادات

### ملف config.json:
```json
{
  "models_directory": "C:\\Models",
  "display_resolution": "1920x1080",
  "enable_gpu_animations": true,
  "default_ai_model": "gpt-4o-mini",
  "ai_provider": "openai",
  "api_key": "your-api-key-here",
  "theme": "dark",
  "language": "ar",
  "auto_refresh_interval": 2000
}
```

### مفتاح AI API:
لتفعيل مساعد الذكاء الاصطناعي:
1. اذهب إلى الإعدادات
2. أدخل مفتاح OpenAI أو Emergent LLM Key
3. احفظ الإعدادات

---

## 🎮 الميزات

### ✅ مراقبة GPU حقيقية:
- درجة الحرارة
- استخدام GPU/الذاكرة
- استهلاك الطاقة
- سرعة الساعة/المروحة
- معلومات PCIe

### ✅ اختبارات أداء حقيقية:
- **CUDA Benchmark**: ضرب مصفوفات لقياس GFLOPS
- **Memory Bandwidth**: قياس سرعة الذاكرة
- **Tensor Core**: اختبار FP16 TFLOPS

### ✅ استدلال AI حقيقي:
- تحميل نماذج ONNX
- تشغيل بدقة FP32/FP16/INT8
- قياس Latency و Throughput

### ✅ مساعد AI:
- محادثة ذكية
- تحليل نتائج الاختبارات
- اقتراحات لتحسين الأداء

---

## ⚠️ حل المشاكل

### لا يظهر GPU:
```bash
# تحقق من التعريف
nvidia-smi

# تحقق من pynvml
python -c "import pynvml; pynvml.nvmlInit(); print('OK')"
```

### CUDA لا يعمل:
```bash
# تحقق من التثبيت
nvcc --version

# تحقق من cupy
python -c "import cupy; print(cupy.cuda.runtime.getDeviceCount())"
```

### الـ Backend لا يبدأ:
```bash
# تشغيل يدوي لرؤية الأخطاء
cd backend
python -m uvicorn server:app --host 127.0.0.1 --port 8080
```

---

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل:
- GitHub Issues
- مساعد AI داخل التطبيق

---

**تم بناؤه بواسطة AI Forge Studio Team** 🚀
