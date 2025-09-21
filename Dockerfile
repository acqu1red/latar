# Используем официальный Node.js образ
FROM node:22-alpine

# Устанавливаем системные зависимости для Sharp
RUN apk add --no-cache \
    vips-dev \
    python3 \
    make \
    g++

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

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Меняем владельца файлов
RUN chown -R nextjs:nodejs /opt/build
USER nextjs

# Открываем порт
EXPOSE 3001

# Команда запуска
CMD ["node", "--max-old-space-size=4096", "server.mjs"]
