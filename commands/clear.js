const fs = require('fs-extra');
const path = require('path');
const { ADMIN_ID } = require('../config');

module.exports = (bot) => {
  bot.command('clear', async (ctx) => {
    console.log('Команда /clear запущена пользователем:', ctx.from.id);
    if (ctx.from.id !== ADMIN_ID) {
      await ctx.reply('⛔️ У вас нет прав для этой команды.');
      return;
    }

    const historyDir = path.join(__dirname, '..', 'history');
    if (!await fs.pathExists(historyDir)) {
      await ctx.reply('📂 Папка истории не существует.');
      return;
    }

    // Видалення points.json
    const pointsPath = path.join(historyDir, 'points.json');
    if (await fs.pathExists(pointsPath)) {
      await fs.remove(pointsPath);
      console.log('Удален файл points.json');
    }

    // Видалення tokens.json
    const tokensPath = path.join(historyDir, 'tokens.json');
    if (await fs.pathExists(tokensPath)) {
      await fs.remove(tokensPath);
      console.log('Удален файл tokens.json');
    }

    // Видалення всіх файлів init_pure_*.json
    const files = await fs.readdir(historyDir);
    const initFiles = files.filter(file => file.startsWith('init_pure_'));
    for (const file of initFiles) {
      const filePath = path.join(historyDir, file);
      await fs.remove(filePath);
      console.log(`Удален файл ${file}`);
    }

    await ctx.reply('✅ Все истории и начальные данные успешно очищены.');
  });
};