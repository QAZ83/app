# دليل البناء - AI Forge Studio

## المتطلبات

### للتشغيل
- Node.js 18 أو أحدث
- npm أو yarn

### للبناء
- Windows 10/11 (64-bit)
- Visual Studio Build Tools (اختياري)

## خطوات التثبيت

### 1. تثبيت Node.js

حمّل من: https://nodejs.org/

```bash
node --version  # يجب أن يكون 18+
npm --version
```

### 2. تثبيت المكتبات

```bash
cd ai-forge-studio
npm install
```

### 3. التشغيل في وضع التطوير

```bash
npm start
```

أو مع DevTools:

```bash
npm run dev
```

## بناء ملف التثبيت

### Windows

```bash
npm run dist:win
```

**الملفات الناتجة:**
- `dist/AI Forge Studio Setup 2.0.0.exe` - ملف التثبيت
- `dist/win-unpacked/` - النسخة المحمولة

### إعدادات البناء

الإعدادات في `package.json` تحت `"build"`:

```json
{
  "build": {
    "appId": "com.aiforge.studio",
    "productName": "AI Forge Studio",
    "win": {
      "target": "nsis"
    },
    "nsis": {
      "oneClick": false,
      "createDesktopShortcut": true
    }
  }
}
```

## استكشاف الأخطاء

### خطأ: electron not found

```bash
npm install electron --save-dev
```

### خطأ: systeminformation

```bash
npm install systeminformation
```

### خطأ في البناء

```bash
npm cache clean --force
rm -rf node_modules
npm install
```

## الخطوات التالية

1. **إضافة أيقونة**: ضع `icon.ico` في `src/frontend/assets/img/`
2. **تخصيص الاسم**: عدّل `productName` في package.json
3. **إضافة شهادة**: للتوقيع الرقمي على Windows
