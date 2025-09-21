# Используем официальный Node.js образ
FROM node:22

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
