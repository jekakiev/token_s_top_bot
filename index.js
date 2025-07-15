require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, '✅ Бот працює!');

    // Надсилає тестове повідомлення у канал
    bot.sendMessage(CHANNEL_ID, '🤖 S-points bot працює на Cyclic.sh!');
});

console.log('S-points bot is running...');
