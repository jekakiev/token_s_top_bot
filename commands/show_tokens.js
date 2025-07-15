const fs = require('fs-extra');
const path = require('path');

module.exports = (bot) => {
  bot.command('show_tokens', async (ctx) => {
    const tokensPath = path.join(__dirname, '..', 'history', 'tokens.json');
    if (!await fs.pathExists(tokensPath)) {
      return ctx.reply('История токенов пуста.');
    }

    const tokens = await fs.readJson(tokensPath);
    let response = '💰 История токенов:\n';
    
    for (const [nick, records] of Object.entries(tokens)) {
      response += `\n${nick}:\n`;
      for (const { date, tokens } of records) {
        response += `  ${date}: ${tokens.toLocaleString('ru-RU')} $S\n`;
      }
    }

    await ctx.reply(response);
  });
};