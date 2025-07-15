const { Telegraf } = require('telegraf');
const config = require('./config');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Бот запущено!'));

bot.help((ctx) => {
  ctx.reply(`📖 Доступные команды:\n` +
    `* /start — запустить бота\n` +
    `* /initial — внести начальную дату + сообщение с /top\n` +
    `* /clear — очистить все истории и начальные данные\n` +
    `* /show_points — посмотреть историю поинтов\n` +
    `* /show_tokens — посмотреть историю токенов\n` +
    `* /top\n` +
    `* /clear\n` +
    `* /help — показать эту справку`);
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));