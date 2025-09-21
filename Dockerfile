# Используем официальный Node.js образ
FROM node:22

# Устанавливаем системные зависимости для sharp
RUN apt-get update && apt-get install -y \
    libvips-dev \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем переменные окружения для безопасности
ENV NODE_ENV=production
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1

# Устанавливаем рабочую директорию
WORKDIR /opt/build

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем остальные файлы
COPY . .

# Создаем папку для загрузок
RUN mkdir -p uploads

# Открываем порт
EXPOSE 3001

# Команда запуска
CMD ["node", "--max-old-space-size=4096", "server.mjs"]
