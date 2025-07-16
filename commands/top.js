const Telegraf = require('telegraf');
const cron = require('node-cron');

module.exports = (bot) => {
  // Функція для запиту /top і відправки в канал з таймаутом
  async function fetchAndForwardTop() {
    try {
      const response = await bot.telegram.sendMessage('@yosoyass_bot', '/top');
      const messageId = response.message_id;

      // Таймаут для уникнення зависання
      return Promise.race([
        new Promise((resolve) => {
          bot.once('message', async (ctx) => {
            if (ctx.message?.forward_from?.username === 'yosoyass_bot' && ctx.message?.reply_to_message?.message_id === messageId) {
              const message = ctx.message.text;
              await bot.telegram.sendMessage('@token_s_top', message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
              });
              await ctx.reply('Топ успешно отправлен в @token_s_top.');
              resolve();
            }
          });
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Таймаут ожидания ответа от @yosoyass_bot')), 30000)) // 30 секунд
      ]);
    } catch (error) {
      console.error('Ошибка при запросе /top:', error);
      if (error.message === 'Таймаут ожидания ответа от @yosoyass_bot') {
        console.log('Таймаут истек, запрос не обработан.');
      }
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
  cron.schedule('0 0 * * *', async () => {
    console.log('Автоматический запрос /top запущен');
    await fetchAndForwardTop().catch((error) => console.error('Ошибка в cron:', error));
  });
};