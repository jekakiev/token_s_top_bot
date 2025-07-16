const { Telegraf } = require('telegraf');
const { ADMIN_ID } = require('./config');
const fs = require('fs');               // 🧩 Додано
const path = require('path');           // 🧩 Додано

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('❌ BOT_TOKEN is not set in environment variables');
}

const bot = new Telegraf(BOT_TOKEN);

// 🔁 Динамічне підключення всіх команд з папки commands
const commandFiles = fs
  .readdirSync(path.join(__dirname, 'commands'))
  .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  command(bot);
}

bot.launch();
console.log('✅ Bot started...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
