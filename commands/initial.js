const fs = require('fs-extra');
const path = require('path');
const { ADMIN_ID } = require('../config');

module.exports = (bot) => {
  bot.command('initial', async (ctx) => {
    if (ctx.from.id !== ADMIN_ID) {
      return ctx.reply('Эта команда доступна только администратору.');
    }

    await ctx.reply('Введите дату в формате YYYY-MM-DD (например, 2025-07-14):');
    bot.hear(/^\d{4}-\d{2}-\d{2}$/, async (ctx) => {
      const date = ctx.message.text;
      ctx.session = ctx.session || {};
      ctx.session.initialDate = date;
      await ctx.reply('Перешлите сообщение с командой /top от @yosoyass_bot:');
      
      bot.on('text', async (ctx) => {
        if (!ctx.session?.initialDate) return;
        const message = ctx.message.text;
        const fileName = `init_pure_${ctx.session.initialDate}.json`;
        const filePath = path.join(__dirname, '..', 'history', fileName);

        // Збереження повідомлення
        await fs.writeJson(filePath, { date, message }, { spaces: 2 });
        await ctx.reply(`Данные сохранены в ${fileName}`);

        // Обробка повідомлення для створення історії поінтів і токенів
        const lines = message.split('\n').filter(line => line.includes('S-points:'));
        const pointsData = {};
        const tokensData = {};

        for (const line of lines) {
          const match = line.match(/(\d+\.\s*.*?)\s*S-points:\s*(\d+)/);
          if (match) {
            const username = match[1].trim().replace(/^\d+\.\s*/, '');
            const points = parseInt(match[2], 10);
            pointsData[username] = points;
            // Припускаємо, що всі поінти за холд (0.1 S-point за 1K S)
            const tokens = (points / 0.1) * 1000;
            tokensData[username] = tokens;
          }
        }

        // Збереження історії поінтів
        const pointsFilePath = path.join(__dirname, '..', 'history', `points_${date}.json`);
        await fs.writeJson(pointsFilePath, pointsData, { spaces: 2 });

        // Збереження історії токенів
        const tokensFilePath = path.join(__dirname, '..', 'history', `tokens_${date}.json`);
        await fs.writeJson(tokensFilePath, tokensData, { spaces: 2 });

        await ctx.reply(`История поинтов и токенов сохранена за ${date}`);
        delete ctx.session.initialDate;
      });
    });
  });
};