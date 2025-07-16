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
      const last = entries.at(-1); // останній запис
      if (last) {
        lastData.push({ nick, sPoints: last.sPoints });
      }
    }

    const sorted = lastData.sort((a, b) => b.sPoints - a.sPoints);

    const lines = sorted.map((user, i) => {
      return `${i + 1}. ${user.nick} S-points: ${user.sPoints}`;
    });

    const chunks = chunkMessage(lines, 50); // Розіб’ємо по 50 записів у кожному повідомленні

    await ctx.reply(`🔄 Надсилаю топ ${sorted.length} учасників за ${today}...`);

    for (const part of chunks) {
      const message = `📊 Топ на ${today}\n\n\`\`\`\n${part.join('\n')}\n\`\`\``;
      await bot.telegram.sendMessage('@token_s_top', message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      });
    }

    await ctx.reply(`✅ Відправлено ${chunks.length} повідомлень у @token_s_top`);
  });
};

// 🔹 Допоміжна функція: розділяє масив на частини по N елементів
function chunkMessage(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
