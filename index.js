const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const topParser = require('./topParser');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// ============= Очищення історії та обробка вчорашніх даних =============

if (config.startWithYesterdaysData) {
    // 1. Очищення історії
    const historyDir = path.join(__dirname, config.historyDir);
    if (fs.existsSync(historyDir)) {
        fs.readdirSync(historyDir).forEach(file => {
            fs.unlinkSync(path.join(historyDir, file));
        });
    }
    // 2. Обробка вчорашніх даних
    const yesterdayPath = path.join(__dirname, config.yesterdaysDataFile);
    if (fs.existsSync(yesterdayPath)) {
        const yesterdaysData = fs.readFileSync(yesterdayPath, 'utf-8');
        const testChatId = process.env.TEST_CHAT_ID || 'YOUR_TEST_CHAT_ID';
        try {
            bot.sendMessage(testChatId, `Тест вчорашніх даних:\n${yesterdaysData}`);
        } catch (e) {
            console.log('Помилка надсилання вчорашніх даних:', e.message);
        }
    }
}

// ============= Основна логіка бота =============

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Бот запущено. Чекаю дані...");
});

// ============= Основний цикл: парсинг сьогоднішніх даних =============

async function mainLoop() {
    try {
        // отримання даних (заміни функцію на свою, якщо потрібно)
        const todayData = await topParser.getTodayData();

        // Зберігаємо відповідь як "вчорашню" (для наступного старту)
        const yesterdaysPath = path.join(__dirname, config.yesterdaysDataFile);
        fs.writeFileSync(yesterdaysPath, JSON.stringify(todayData), 'utf-8');

        // Відправка у основний чат (замінити на потрібний ID)
        const mainChatId = process.env.MAIN_CHAT_ID || 'YOUR_MAIN_CHAT_ID';
        bot.sendMessage(mainChatId, `Сьогоднішні TOP дані:\n${JSON.stringify(todayData, null, 2)}`);
    } catch (error) {
        console.error('mainLoop error:', error);
    }
}

// ============= Запуск циклу (можна викликати за розкладом або вручну) =============

mainLoop();
