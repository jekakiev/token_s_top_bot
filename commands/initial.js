const fs = require('fs-extra');
const path = require('path');
const dayjs = require('dayjs');
const { ADMIN_ID } = require('../config');

module.exports = (bot) => {
  bot.command('initial', async (ctx) => {
    if (ctx.from.id !== ADMIN_ID) {
      return ctx.reply('Эта команда доступна только администратору.');
    }

    await ctx.reply('Введите дату в формате YYYY-MM-DD (например, 2025-07-14):');
    bot.once('text', async (dateCtx) => {
      const date = dateCtx.message.text;
      if (!dayjs(date, 'YYYY-MM-DD', true).isValid()) {
        return dateCtx.reply('Неверный формат даты. Используйте YYYY-MM-DD.');
      }

      ctx.session = ctx.session || {};
      ctx.session.initialDate = date;
      await dateCtx.reply('Перешлите сообщение с командой /top от @yosoyass_bot:');

      bot.once('text', async (msgCtx) => {
        if (!ctx.session?.initialDate) return;
        const message = msgCtx.message.text;
        const date = ctx.session.initialDate;
        const fileName = `init_pure_${date}.json`;
        const filePath = path.join(__dirname, '..', 'history', fileName);

        // Збереження сирого повідомлення
        await fs.writeJson(filePath, { date, message }, { spaces: 2 });
        await msgCtx.reply(`Данные сохранены в ${fileName}`);

        // Парсинг повідомлення
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

        // Оновлення історії поінтів (points.json)
        const pointsPath = path.join(__dirname, '..', 'history', 'points.json');
        let points = {};
        if (await fs.pathExists(pointsPath)) {
          points = await fs.readJson(pointsPath);
        }
        for (const { nick, sPoints } of topList) {
          if (!points[nick]) points[nick] = [];
          points[nick].push({ date, sPoints });
        }
        await fs.writeJson(pointsPath, points, { spaces: 2 });

        // Оновлення історії токенів (tokens.json)
        const tokensPath = path.join(__dirname, '..', 'history', 'tokens.json');
        let tokens = {};
        if (await fs.pathExists(tokensPath)) {
          tokens = await fs.readJson(tokensPath);
        }
        for (const { nick, sPoints } of topList) {
          const tokensValue = (sPoints / 0.1) * 1000; // 0.1 S-point за 1K S
          if (!tokens[nick]) tokens[nick] = [];
          tokens[nick].push({ date, tokens: tokensValue });
        }

        await fs.writeJson(tokensPath, tokens, { spaces: 2 });
        await msgCtx.reply(`История поинтов и токенов заполнена как начальные данные за ${date}`);
        delete ctx.session.initialDate;
      });
    });
  });
};