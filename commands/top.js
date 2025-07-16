const Telegraf = require('telegraf');
const cron = require('node-cron');

module.exports = (bot) => {
  // Функція для запиту /top і відправки в канал
  async function fetchAndForwardTop() {
    try {
      const response = await bot.telegram.sendMessage('@yosoyass_bot', '/top');
      const messageId = response.message_id;

      // Чекаємо відповіді і пересилаємо в канал
      bot.on('message', async (ctx) => {
        if (ctx.message?.forward_from?.username === 'yosoyass_bot' && ctx.message?.reply_to_message?.message_id === messageId) {
          const message = ctx.message.text;
          await bot.telegram.sendMessage('@token_s_top', message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
          });
          await ctx.reply('Топ успешно отправлен в @token_s_top.');
        }
      });
    } catch (error) {
      console.error('Ошибка при запросе /top:', error);
    }
  }

  // Ручна команда /top
  bot.command('top', async (ctx) => {
    if (ctx.from.id !== ADMIN_ID) {
      await ctx.reply('⛔️ У вас нет прав для этой команды.');
      return;
    }
    await fetchAndForwardTop();
    await ctx.reply('Запрос /top отправлен @yosoyass_bot. Ожидайте обновления...');
  });

  // Автоматичний запуск щоденно о 03:00 EEST (00:00 UTC)
  cron.schedule('0 0 * * *', () => {
    console.log('Автоматический запрос /top запущен');
    fetchAndForwardTop();
  });
};