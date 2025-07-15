const fs = require('fs-extra');
const path = require('path');
const dayjs = require('dayjs');
const { ADMIN_ID } = require('../config');
const { Telegraf, Scenes, session } = require('telegraf');

module.exports = (bot) => {
  // Створення сцени для /initial
  const initialScene = new Scenes.WizardScene(
    'initialWizard',
    async (ctx) => {
      if (ctx.from.id !== ADMIN_ID) {
        await ctx.reply('Эта команда доступна только администратору.');
        return ctx.scene.leave();
      }
      await ctx.reply('Введите дату в формате YYYY-MM-DD (например, 2025-07-14):');
      return ctx.wizard.next();
    },
    async (ctx) => {
      const date = ctx.message?.text;
      if (!date || !dayjs(date, 'YYYY-MM-DD', true).isValid()) {
        await ctx.reply('Неверный формат даты. Используйте YYYY-MM-DD.');
        return ctx.wizard.back();
      }
      ctx.scene.state.date = date;
      await ctx.reply('Перешлите сообщение с командой /top от @yosoyass_bot:');
      return ctx.wizard.next();
    },
    async (ctx) => {
      console.log('Получено сообщение:', ctx.message);
      const message = ctx.message?.text || ctx.message?.forward_from?.username === 'yosoyass_bot' && ctx.message?.text;
      if (!message) {
        await ctx.reply('Пожалуйста, перешлите сообщение с /top от @yosoyass_bot.');
        return ctx.wizard.back();
      }

      const date = ctx.scene.state.date;
      const historyDir = path.join(__dirname, '..', 'history');
      await fs.ensureDir(historyDir); // Створюємо папку history, якщо її немає

      const fileName = `init_pure_${date}.json`;
      const filePath = path.join(historyDir, fileName);

      // Збереження сирого повідомлення
      await fs.writeJson(filePath, { date, message }, { spaces: 2 });
      await ctx.reply(`Данные сохранены в ${fileName}`);

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
      console.log('Разобранный топ:', topList);

      // Оновлення історії поінтів (points.json)
      const pointsPath = path.join(historyDir, 'points.json');
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
      const tokensPath = path.join(historyDir, 'tokens.json');
      let tokens = {};
      if (await fs.pathExists(tokensPath)) {
        tokens = await fs.readJson(tokensPath);
      }
      for (const { nick, sPoints } of topList) {
        const tokensValue = (sPoints / 0.1) * 1000; // 0.1 S-point за 1K S
        if (!tokens[nick]) tokens[nick] = [];
        tokens[nick].push({ date, tokens: tokensValue });
      }
      await fs.writeJson(tokensPath, tokens, { spaces: 2});

      await ctx.reply(`История поинтов и токенов заполнена как начальные данные за ${date}. ✅ Успешно завершено!`);
      return ctx.scene.leave();
    }
  );

  // Реєстрація сцени
  const stage = new Scenes.Stage([initialScene]);
  bot.use(session());
  bot.use(stage.middleware());

  bot.command('initial', async (ctx) => {
    console.log('Запуск сцены /initial');
    await ctx.scene.enter('initialWizard');
  });
};