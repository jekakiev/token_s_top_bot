const { Telegraf } = require('telegraf');
const { ADMIN_ID, BOT_TOKEN } = require('./config');

const bot = new Telegraf(BOT_TOKEN);

// Ініціалізація команд (тимчасово відключимо непотрібні)
require('./commands/top')(bot);

// require('./commands/initial')(bot);
// require('./commands/clear')(bot);
// require('./commands/show_points')(bot);
// require('./commands/show_tokens')(bot);

bot.launch()
  .then(() => console.log('Bot started...'))
  .catch((err) => console.error('Error starting bot:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));