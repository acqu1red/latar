# Используем официальный образ Node.js с Python
FROM node:18-bullseye

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем Node.js зависимости
RUN npm ci --only=production

# Создаем виртуальное окружение Python
RUN python3 -m venv controlnet_env

# Активируем виртуальное окружение и устанавливаем Python зависимости
RUN . controlnet_env/bin/activate && \
    pip install --upgrade pip && \
    pip install torch torchvision diffusers transformers accelerate controlnet-aux opencv-python Pillow numpy scipy matplotlib tqdm

# Копируем исходный код
COPY . .

# Создаем директорию для загрузок
RUN mkdir -p uploads

# Открываем порт
EXPOSE 3001

# Команда запуска
CMD ["sh", "-c", "source controlnet_env/bin/activate && npm start"]
