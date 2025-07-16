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
      const last = entries.at(-1); // беремо останній запис
      if (last) {
        lastData.push({ nick, sPoints: last.sPoints });
      }
    }

    const sorted = lastData.sort((a, b) => b.sPoints - a.sPoints);

    // Форматування повідомлення з використанням blockquote
    const lines = sorted.map((user, i) => {
      return `${i + 1}. ${user.nick} ${user.sPoints}`;
    });

    const message = `📊 Топ на ${today}\n\n${format`Format text as ${blockquote`${lines.join('\n')}`}`}`;

    await bot.telegram.sendMessage('@token_s_top', message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    });

    await ctx.reply(`✅ Повідомлення відправлено в канал @token_s_top`);
  });
};

// Форматування з blockquote
function format(strings, ...values) {
  return strings.reduce((result, str, i) => result + str + (values[i] ? values[i] : ''), '');
}
