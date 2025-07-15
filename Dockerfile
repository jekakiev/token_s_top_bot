# Використовуємо офіційний образ Node.js
FROM node:18-slim

# Встановлюємо робочу директорію
WORKDIR /app

# Копіюємо package.json і package-lock.json
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо весь код проєкту
COPY . .

# Команда для запуску бота
CMD ["node", "index.js"]