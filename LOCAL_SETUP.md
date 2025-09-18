# 🏠 Настройка локального ScribbleDiffusion

## ✅ **Преимущества локального использования**

- **Без кредитов** - никаких ограничений по использованию
- **Полный контроль** - настройка под ваши нужды
- **Приватность** - данные не покидают ваш компьютер
- **Быстрота** - нет задержек на сеть

## 🚀 **Варианты настройки**

### **Вариант 1: Hugging Face Transformers (Рекомендуется)**

#### 1. Установка Python и зависимостей
```bash
# Установите Python 3.8+
pip install torch torchvision torchaudio
pip install diffusers transformers accelerate
pip install controlnet-aux
pip install fastapi uvicorn
```

#### 2. Создание локального сервера
Создайте файл `huggingface_server.py`:
```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel
from PIL import Image
import base64
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Загружаем модель
controlnet = ControlNetModel.from_pretrained("lllyasviel/sd-controlnet-scribble")
pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    controlnet=controlnet,
    torch_dtype=torch.float16
)

@app.post("/api/predict")
async def predict(data: dict):
    try:
        # Декодируем изображение
        image_data = data["inputs"]["image"].split(",")[1]
        image = Image.open(io.BytesIO(base64.b64decode(image_data)))
        
        # Генерируем изображение
        result = pipe(
            data["inputs"]["prompt"],
            image=image,
            num_inference_steps=data["inputs"]["num_inference_steps"],
            guidance_scale=data["inputs"]["guidance_scale"],
            controlnet_conditioning_scale=data["inputs"]["controlnet_conditioning_scale"]
        )
        
        # Конвертируем в base64
        buffered = io.BytesIO()
        result.images[0].save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return {"output": [f"data:image/png;base64,{img_str}"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
```

#### 3. Запуск сервера
```bash
python huggingface_server.py
```

### **Вариант 2: Ollama (Проще в настройке)**

#### 1. Установка Ollama
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Скачайте с https://ollama.ai/download
```

#### 2. Установка модели Stable Diffusion
```bash
ollama pull stable-diffusion
```

#### 3. Запуск сервера
```bash
ollama serve
```

### **Вариант 3: Docker (Самый простой)**

#### 1. Создайте docker-compose.yml
```yaml
version: '3.8'
services:
  stable-diffusion:
    image: ghcr.io/automatic1111/stable-diffusion-webui:latest
    ports:
      - "7860:7860"
    volumes:
      - ./models:/app/models
    environment:
      - CLI_ARGS=--api --listen --port 7860
```

#### 2. Запуск
```bash
docker-compose up -d
```

## ⚙️ **Настройка проекта**

### 1. Обновите переменные окружения
Создайте файл `.env` в папке `backend/`:
```env
# Локальные сервисы
USE_LOCAL_MODEL=true
HUGGINGFACE_API_URL=http://localhost:7860
OLLAMA_API_URL=http://localhost:11434

# Отключите Replicate (опционально)
# REPLICATE_API_TOKEN=
```

### 2. Перезапустите сервер
```bash
cd backend
npm start
```

## 🔧 **Проверка работы**

### 1. Проверьте статус сервисов
Откройте в браузере:
- Hugging Face: http://localhost:7860/health
- Ollama: http://localhost:11434/api/tags

### 2. Тестирование
1. Загрузите изображение плана
2. Выберите тип генерации
3. Нажмите "Сгенерировать"
4. Проверьте консоль на наличие сообщений о локальной генерации

## 📊 **Производительность**

| Метод | Скорость | Качество | Память | Сложность |
|-------|----------|----------|--------|-----------|
| Hugging Face | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Ollama | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Docker | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ |
| Fallback | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ |

## 🚨 **Устранение проблем**

### Проблема: "Hugging Face недоступен"
**Решение:**
1. Проверьте, что сервер запущен на порту 7860
2. Убедитесь, что установлены все зависимости
3. Проверьте логи сервера

### Проблема: "Ollama недоступен"
**Решение:**
1. Убедитесь, что Ollama установлен и запущен
2. Проверьте, что модель stable-diffusion загружена
3. Проверьте порт 11434

### Проблема: "Все методы недоступны"
**Решение:**
1. Система автоматически переключится на улучшенную локальную генерацию
2. Это даст хороший результат для архитектурных планов
3. Проверьте логи для диагностики

## 🎯 **Рекомендации**

1. **Для начала**: Используйте Docker вариант - самый простой
2. **Для разработки**: Hugging Face - лучший контроль
3. **Для продакшена**: Ollama - хороший баланс
4. **Fallback**: Всегда работает, качество приемлемое

## 🔄 **Автоматическое переключение**

Система автоматически:
1. Пробует Hugging Face API
2. Если недоступен - пробует Ollama
3. Если недоступен - использует улучшенную локальную генерацию
4. Всегда дает результат!

---

**Готово!** Теперь у вас есть полноценная локальная система генерации без ограничений по кредитам! 🎉
