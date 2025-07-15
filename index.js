require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { parseTopList, parseUserPoints } = require('./modules/topParser');
const { saveDayTop, getHistory } = require('./modules/history');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Команда для перевірки роботи
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, '✅ Бот працює!');
});

// Основна команда для збереження топу
bot.onText(/\/save_top/, async (msg) => {
    bot.sendMessage(msg.chat.id, 'Відправ текст топу (скопійований з бота):');
    bot.once('message', (topMsg) => {
        if (!topMsg.text || !topMsg.text.includes('S-points фарминг')) {
            bot.sendMessage(topMsg.chat.id, '❌ Немає S-points фармінг у тексті!');
            return;
        }
        const date = (new Date()).toISOString().slice(0, 10); // yyyy-mm-dd
        const topLines = parseTopList(topMsg.text);
        const parsed = topLines.map(parseUserPoints).filter(Boolean);

        saveDayTop(date, parsed);

        // Формуємо quote block
        const quoteBlock = '```\n' + topLines.join('\n') + '\n```';
        bot.sendMessage(CHANNEL_ID, `Топ холдерів за ${date}:\n${quoteBlock}`, { parse_mode: 'Markdown' });
        bot.sendMessage(topMsg.chat.id, '✅ Збережено!');
    });
});

console.log('S-points bot is running...');
