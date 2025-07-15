const { Telegraf } = require('telegraf');
const fs = require('fs-extra');
const path = require('path');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Підключення команд
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  command(bot);
}

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));