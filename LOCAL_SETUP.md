# 🚀 Локальная установка Stable Diffusion

## Проблема с кредитами Replicate

Сейчас система использует Replicate API, который требует оплаты кредитов. Для бесплатного использования мы настроим локальную Stable Diffusion с ControlNet.

## 🎯 Что мы получим

- **Точное воспроизведение планов** без творческих изменений
- **Полная независимость** от внешних API
- **Бесплатное использование** без ограничений
- **Лучшее качество** для архитектурных чертежей

## 📦 Установка

### Вариант 1: Автоматическая установка (рекомендуется)

```bash
# Запустите скрипт установки
./setup-stable-diffusion.sh
```

### Вариант 2: Ручная установка

1. **Установите Python 3.10+**
2. **Установите CUDA** (для GPU) или используйте CPU
3. **Клонируйте Stable Diffusion WebUI**:
   ```bash
   git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
   ```
4. **Установите ControlNet**:
   ```bash
   cd stable-diffusion-webui
   git clone https://github.com/Mikubill/sd-webui-controlnet.git extensions/sd-webui-controlnet
   ```
5. **Скачайте модели**:
   - Stable Diffusion 1.5: `v1-5-pruned-emaonly.ckpt`
   - ControlNet scribble: `control_v11p_sd15_scribble.pth`

## 🚀 Запуск

### Запуск Stable Diffusion WebUI

```bash
cd stable-diffusion-webui
python webui.py --api --listen
```

### Запуск нашего сервера

```bash
cd backend
npm start
```

### Запуск фронтенда

```bash
cd frontend
npm run dev
```

## 🔧 Настройка

### Конфигурация ControlNet

1. Откройте WebUI: http://127.0.0.1:7860
2. Перейдите в раздел "ControlNet"
3. Загрузите модель `control_v11p_sd15_scribble.pth`
4. Настройте параметры:
   - **Weight**: 1.0 (максимальное следование контуру)
   - **Guidance Start**: 0.0
   - **Guidance End**: 1.0
   - **Pixel Perfect**: ✅

### Промпты для точного воспроизведения

Система автоматически использует промпты:
- `a professional architectural floor plan drawing, perfectly centered on a clean white background`
- `The floor plan should be drawn exactly as shown in the reference image with precise proportions`
- `Clean, professional architectural drawing style with black lines on white background`

## 🎨 Как это работает

1. **Загружается фото плана** → система создает эскиз
2. **ControlNet анализирует контуры** → точно следует структуре
3. **Stable Diffusion генерирует** → профессиональный чертеж
4. **Результат центрируется** → план строго по центру

## ⚡ Преимущества локальной версии

- ✅ **Бесплатно** - никаких кредитов
- ✅ **Точно** - ControlNet следует контурам без изменений  
- ✅ **Быстро** - работает на вашем компьютере
- ✅ **Приватно** - данные не покидают ваш компьютер
- ✅ **Настраиваемо** - полный контроль над параметрами

## 🔄 Fallback система

Если Stable Diffusion недоступна, система автоматически переключается на:
1. **Replicate API** (если есть кредиты)
2. **Простая локальная обработка** (базовое улучшение изображения)

## 🛠️ Устранение проблем

### WebUI не запускается
```bash
# Проверьте Python версию
python3 --version

# Установите зависимости
pip install -r requirements.txt
```

### ControlNet не работает
```bash
# Перезапустите WebUI с ControlNet
python webui.py --api --listen --enable-insecure-extension-access
```

### Медленная генерация
- Используйте GPU вместо CPU
- Уменьшите разрешение в настройках
- Закройте другие приложения

## 📊 Требования к системе

- **RAM**: 8GB+ (рекомендуется 16GB)
- **GPU**: NVIDIA с 4GB+ VRAM (опционально)
- **Диск**: 10GB+ свободного места
- **Python**: 3.10+

## 🎯 Результат

После настройки вы получите:
- Точные копии планов квартир
- Профессиональные архитектурные чертежи
- Планы строго по центру
- Полную независимость от внешних сервисов
