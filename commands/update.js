const fs = require('fs-extra');
const path = require('path');
const dayjs = require('dayjs');
const { ADMIN_ID } = require('../config');

module.exports = (bot) => {
  bot.command('update', async (ctx) => {
    if (ctx.from.id !== ADMIN_ID) {
      await ctx.reply('⛔️ Ця команда тільки для адміністратора.');
      return;
    }

    await ctx.reply(
      '📥 Будь ласка, перешли повідомлення з командою /top від @yosoyass_bot.\nЯ перевірю, чи є оновлення.'
    );
  });

  bot.on('message', async (ctx) => {
    if (ctx.message?.forward_from?.username !== 'yosoyass_bot') return;

    const message = ctx.message.text;
    const today = dayjs().format('YYYY-MM-DD');
    const historyDir = path.join('/data', 'history');
    const updatedFileName = `STOP_updated_${today}.json`;
    const updatedFilePath = path.join(historyDir, updatedFileName);

    await fs.ensureDir(historyDir);

    // 1️⃣ Якщо файл вже існує і текст такий самий
    if (await fs.pathExists(updatedFilePath)) {
      const existing = await fs.readJson(updatedFilePath);
      if (existing.message === message) {
        await ctx.reply('ℹ️ Дані не змінились. Оновлення не потрібне.');
        return;
      }
    }

    // 2️⃣ Зберігаємо новий файл
    await fs.writeJson(updatedFilePath, { date: today, message }, { spaces: 2 });

    // 3️⃣ Парсимо S-points
    const regex = /\d+\.\s+(.+?)\s+S-points:\s*([\d\s]+)/g;
    const topList = [];
    let match;
    while ((match = regex.exec(message)) !== null) {
      const nick = match[1].trim();
      const sPoints = parseInt(match[2].replace(/\s/g, ''), 10);
      if (!isNaN(sPoints)) {
        topList.push({ nick, sPoints });
      }
    }

    // 4️⃣ Оновлюємо points.json
    const pointsPath = path.join(historyDir, 'points.json');
    let points = {};
    if (await fs.pathExists(pointsPath)) {
      points = await fs.readJson(pointsPath);
    }

    for (const { nick, sPoints } of topList) {
      if (!points[nick]) points[nick] = [];
      points[nick].push({ date: today, sPoints });
    }

    await fs.writeJson(pointsPath, points, { spaces: 2 });

    await ctx.reply(`✅ Дані оновлено за ${today} і додано до історії.`);
  });
};
