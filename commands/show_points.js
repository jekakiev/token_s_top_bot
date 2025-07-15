const fs = require('fs-extra');
const path = require('path');

module.exports = (bot) => {
  bot.command('show_points', async (ctx) => {
    const historyDir = path.join(__dirname, '..', 'history');
    const files = await fs.readdir(historyDir);
    const pointsFiles = files.filter(file => file.startsWith('points_'));

    if (pointsFiles.length === 0) {
      return ctx.reply('История поинтов пуста.');
    }

    let response = '📊 История поинтов:\n';
    for (const file of pointsFiles) {
      const filePath = path.join(historyDir, file);
      const data = await fs.readJson(filePath);
      const date = file.replace('points_', '').replace('.json', '');
      response += `\nДата: ${date}\n`;
      for (const [username, points] of Object.entries(data)) {
        response += `${username}: ${points} S-points\n`;
      }
    }

    await ctx.reply(response);
  });
};