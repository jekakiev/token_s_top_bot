const { Markup } = require('telegraf');
const fs = require('fs-extra');
const path = require('path');
const dayjs = require('dayjs');
const { ADMIN_ID } = require('../config');

module.exports = (bot) => {
  bot.command('send_points', async (ctx) => {
    if (ctx.from.id !== ADMIN_ID) {
      await ctx.reply('⛔️ Ця команда тільки для адміністратора.');
      return;
    }

    const historyDir = path.join('/data', 'history');
    const pointsPath = path.join(historyDir, 'points.json');

    if (!(await fs.pathExists(pointsPath))) {
      await ctx.reply('⚠️ Файл points.json не знайдено.');
      return;
    }

    const points = await fs.readJson(pointsPath);
    const today = dayjs().format('YYYY-MM-DD');
    const lastData = [];

    for (const [nick, entries] of Object.entries(points)) {
      const last = entries.at(-1);
      if (last) {
        lastData.push({ nick, sPoints: last.sPoints });
      }
    }

    const sorted = lastData.sort((a, b) => b.sPoints - a.sPoints);

    const lines = sorted.map((user, i) => {
      return `${i + 1}. ${user.nick} ${user.sPoints}`;
    });

    const message = `📊 Топ на ${today}\n\n${lines.slice(0, 10).join('\n')}`;

    // Створення кнопки "Розгорнути"
    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('Розгорнути весь список', 'show_full_list')
    ]);

    // Відправка повідомлення з кнопкою
    const sentMessage = await ctx.reply(message, {
      reply_markup: keyboard,
      parse_mode: 'Markdown',
    });

    bot.action('show_full_list', async (ctx) => {
      // Відправлення розгорнутого повідомлення
      const fullMessage = `📊 Топ на ${today}\n\n${lines.join('\n')}`;
      await ctx.editMessageText(fullMessage, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [] }, // видаляємо кнопку після натискання
      });
    });
  });
};
