module.exports = (bot) => {
  console.log('🔁 Команда /top готова');

  // /top — инструкция для пользователя
  bot.command('top', async (ctx) => {
    await ctx.reply(
      '📥 Чтобы получить топ холдеров:\n\n1. Открой @yosoyass_bot в Telegram\n2. Отправь ему команду /top\n3. Перешли его ответ сюда в этот чат\n\n✅ Я автоматически обработаю сообщение и отправлю данные в канал.'
    );
  });

  // Обработка пересланного сообщения
  bot.on('message', async (ctx) => {
    try {
      const forwarded = ctx.message?.forward_from?.username === 'yosoyass_bot';
      if (!forwarded) return;

      const text = ctx.message.text;

      if (!text) {
        await ctx.reply('⚠️ Сообщение от @yosoyass_bot не содержит текста.');
        return;
      }

      // Отправка в канал
      await bot.telegram.sendMessage('@token_s_top', text, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });

      await ctx.reply('✅ Данные от @yosoyass_bot обработаны и отправлены в канал @token_s_top');
    } catch (err) {
      console.error('❌ Ошибка при обработке сообщения:', err);
      await ctx.reply('❌ Произошла ошибка при обработке. Попробуй ещё раз.');
    }
  });
};
