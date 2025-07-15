const fs = require('fs-extra');
const path = require('path');

module.exports = (bot) => {
  bot.command('show_points', async (ctx) => {
    const pointsPath = path.join(__dirname, '..', 'history', 'points.json');
    if (!await fs.pathExists(pointsPath)) {
      return ctx.reply('История поинтов пуста.');
    }

    const points = await fs.readJson(pointsPath);
    let response = '📊 История поинтов:\n';
    
    for (const [nick, records] of Object.entries(points)) {
      response += `\n${nick}:\n`;
      for (const { date, sPoints } of records) {
        response += `  ${date}: ${sPoints} S-points\n`;
      }
    }

    await ctx.reply(response);
  });
};