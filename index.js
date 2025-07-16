const { Telegraf } = require('telegraf');
const { ADMIN_ID } = require('./config');

// беремо токен з середовища
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('❌ BOT_TOKEN is not set in environment variables');
}

const bot = new Telegraf(BOT_TOKEN);

// Ініціалізація команд
require('./commands/top')(bot);

// Запуск бота
bot.launch();
console.log('✅ Bot started...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
