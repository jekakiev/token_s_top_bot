const fs = require('fs-extra');
const path = require('path');
const { ADMIN_ID } = require('../config');

module.exports = (bot) => {
  bot.command('clear', async (ctx) => {
    if (ctx.from.id !== ADMIN_ID) {
      return ctx.reply('⛔️ У вас нет прав для этой команды.');
    }

    const historyDir = path.join(__dirname, '..', 'history');

    // Очищення points.json і tokens.json
    await fs.writeJson(path.join(historyDir, 'points.json'), {}, { spaces: 2 });
    await fs.writeJson(path.join(historyDir, 'tokens.json'), {}, { spaces: 2 });

    // Видалення всіх файлів init_pure_*.json
    const files = await fs.readdir(historyDir);
    const initFiles = files.filter(file => file.startsWith('init_pure_'));
    for (const file of initFiles) {
      await fs.remove(path.join(historyDir, file));
    }

    await ctx.reply('✅ Все истории и начальные данные успешно очищены.');
  });
};