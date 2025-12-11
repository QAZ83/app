# AI Forge Studio

<div align="center">

![AI Forge Studio Logo](src/frontend/assets/img/logo.png)

**تطبيق سطح المكتب لمراقبة GPU والاستدلال بالذكاء الاصطناعي**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)]()
[![Platform](https://img.shields.io/badge/platform-Windows-green.svg)]()
[![Electron](https://img.shields.io/badge/electron-28.0.0-9feaf9.svg)]()

</div>

---

## المميزات

- **مراقبة GPU في الوقت الحقيقي**: عرض استخدام GPU، درجة الحرارة، الذاكرة، والطاقة
- **استدلال الذكاء الاصطناعي**: تشغيل نماذج AI مع دعم TensorRT
- **مساعد AI ذكي**: محادثة مع مساعد AI متخصص في GPU
- **واجهة مستخدم احترافية**: تصميم داكن عصري وسهل الاستخدام
- **إعدادات قابلة للتخصيص**: تحكم كامل في سلوك التطبيق

---

## المتطلبات

- **نظام التشغيل**: Windows 10/11 (64-bit)
- **Node.js**: الإصدار 18 أو أحدث (للتطوير فقط)
- **Yarn**: مدير الحزم (للتطوير فقط)
- **GPU**: NVIDIA (اختياري - للبيانات الحقيقية)

---

## التثبيت والتشغيل

### للمستخدمين (تشغيل من المصدر)

```bash
# 1. انتقل إلى مجلد المشروع
cd ai-forge-studio

# 2. تثبيت التبعيات
yarn install

# 3. تشغيل التطبيق
yarn start
```

### للمطورين

```bash
# تشغيل في وضع التطوير (مع DevTools)
yarn dev
```

---

## بناء ملف التثبيت (.exe)

```bash
# بناء ملف exe للويندوز
yarn dist:win

# ستجد الملف في:
# dist/AI Forge Studio Setup.exe
```

---

## هيكل المشروع

```
ai-forge-studio/
├── main.js              # العملية الرئيسية (Backend)
├── preload.js           # جسر الاتصال بين Frontend و Backend
├── package.json         # تكوين المشروع
├── src/
│   ├── backend/         # وحدات Backend
│   └── frontend/
│       ├── index.html   # الصفحة الرئيسية
│       ├── assets/
│       │   ├── css/     # أنماط CSS
│       │   ├── js/      # كود JavaScript
│       │   └── img/     # الصور والأيقونات
│       ├── pages/       # صفحات التطبيق
│       └── components/  # مكونات قابلة لإعادة الاستخدام
└── docs/                # الوثائق
```

---

## الـ API المتاح

الواجهة البرمجية متاحة عبر `window.AIForgeAPI`:

```javascript
// مراقبة GPU
window.AIForgeAPI.getGpuMetrics()

// الإعدادات
window.AIForgeAPI.getSetting(key)
window.AIForgeAPI.setSetting(key, value)
window.AIForgeAPI.getAllSettings()

// مساعد AI
window.AIForgeAPI.sendChatMessage({ message, model })

// الاستدلال
window.AIForgeAPI.runInference({ model, precision, batchSize })
```

---

## إعداد مساعد AI

التطبيق يستخدم **Emergent LLM Key** بشكل افتراضي للمحادثة مع AI.
يمكنك تغيير هذا من صفحة الإعدادات وإضافة مفتاح API الخاص بك.

---

## الترخيص

MIT License - مفتوح المصدر

---

## الدعم

إذا واجهت أي مشاكل، يرجى فتح issue على GitHub أو التواصل معنا.
