const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const settings = require('./settings.json');
const { generateDailyReport } = require('./dailyProcessor');
const topParser = require('./topParser');
const { saveHistory, saveAnomalies } = require('./historyManager');
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

let yesterdayData = null;
let todayData = null;

// ====== Очистка истории при запуске ======
if (settings.mode === 'manual') {
    const historyPath = path.join(__dirname, 'data/history');
    if (fs.existsSync(historyPath)) {
        fs.readdirSync(historyPath).forEach(file => {
            fs.unlinkSync(path.join(historyPath, file));
        });
    }
}

// ====== Запросить вчерашние данные ======
const adminId = settings.admin_ids[0];
bot.sendMessage(adminId, 'Пожалуйста, отправьте вчерашний пост от @token_s_top для анализа.');

// ====== Обработка входящего сообщения от админа ======
bot.on('message', async (msg) => {
    if (msg.chat.id !== adminId || !msg.text || yesterdayData) return;

    try {
        yesterdayData = topParser.parse(msg.text);
        bot.sendMessage(adminId, '✅ Вчерашние данные получены. Получаю сегодняшние...');
        await fetchTodayAndCompare();
    } catch (err) {
        bot.sendMessage(adminId, '❌ Не удалось обработать сообщение. Убедитесь, что это правильный пост с топом.');
    }
});

// ====== Отправка /top в бот и сравнение ======
async function fetchTodayAndCompare() {
    try {
        const sourceBotUsername = settings.telegram.source_bot_username;
        await bot.sendMessage(sourceBotUsername, '/top');

        // Ждём ответ с топом
        bot.once('message', (msg) => {
            if (!msg.text.includes('S-points')) return;

            try {
                todayData = topParser.parse(msg.text);
                const report = generateDailyReport(yesterdayData, todayData);

                // 📬 Отправка финального отчета в канал
                bot.sendMessage(settings.telegram.channel_id, report);
                bot.sendMessage(adminId, '✅ Ежедневный отчёт успешно отправлен в канал.');

                // 💾 Сохранение истории
                saveHistory(todayData);

                // ⚠ Проверка и сохранение аномалий
                const anomalies = saveAnomalies(yesterdayData, todayData);
                if (anomalies && settings.anomalies.notify) {
                    const message = `⚠ Обнаружены аномалии:\n` + anomalies.map(a =>
                        `— ${a.nickname}: прирост +${a.diff}`
                    ).join('\n');
                    bot.sendMessage(adminId, message);
                }

            } catch (e) {
                bot.sendMessage(adminId, '❌ Ошибка при парсинге сегодняшних данных.');
            }
        });

    } catch (err) {
        bot.sendMessage(adminId, '❌ Не удалось отправить /top в исходный бот.');
    }
}
