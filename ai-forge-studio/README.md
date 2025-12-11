# AI Forge Studio

## 🎯 GPU Inference & Monitoring Desktop Suite

تطبيق سطح مكتب احترافي لمراقبة أداء GPU وتشغيل نماذج الذكاء الاصطناعي.

![AI Forge Studio](screenshot.png)

## ✨ الميزات

- **لوحة تحكم GPU**: مراقبة درجة الحرارة، الاستخدام، الذاكرة، الطاقة
- **محرك استدلال**: تشغيل نماذج AI مع TensorRT/ONNX
- **مساعد ذكي**: محادثة AI للمساعدة في تحسين الأداء
- **إعدادات متقدمة**: تخصيص كامل للتطبيق

## 🚀 التشغيل السريع

### متطلبات
- Node.js 18+
- Windows 10/11 (64-bit)
- NVIDIA GPU (مستحسن)

### التثبيت

```bash
# استنساخ المشروع
git clone https://github.com/your-repo/ai-forge-studio.git
cd ai-forge-studio

# تثبيت المكتبات
npm install

# تشغيل التطبيق
npm start
```

### بناء ملف EXE

```bash
npm run dist:win
```

الملف الناتج: `dist/AI Forge Studio Setup.exe`

## 📁 هيكل المشروع

```
ai-forge-studio/
├── main.js              # Electron main process
├── preload.js           # Preload script (API bridge)
├── package.json         # Dependencies & build config
├── src/
│   └── frontend/
│       ├── index.html   # Main HTML shell
│       └── assets/
│           ├── css/     # Stylesheets
│           └── js/      # Application logic
└── dist/                # Build output
```

## 🔌 توصيل AI Backend

لتفعيل المحادثة الذكية:

1. افتح **الإعدادات** في التطبيق
2. أدخل **مفتاح API** من OpenAI أو Anthropic
3. اختر **النموذج** المطلوب

## 🔧 التطوير

```bash
# تشغيل مع DevTools
npm run dev
```

## 📝 الرخصة

MIT License
