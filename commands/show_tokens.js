const fs = require('fs-extra');
const path = require('path');

module.exports = (bot) => {
  bot.command('show_tokens', async (ctx) => {
    const historyDir = path.join(__dirname, '..', 'history');
    const files = await fs.readdir(historyDir);
    const tokensFiles = files.filter(file => file.startsWith('tokens_'));

    if (tokensFiles.length === 0) {
      return ctx.reply('История токенов пуста.');
    }

    let response = '💰 История токенов:\n';
    for (const file of tokensFiles) {
      const filePath = path.join(historyDir, file);
      const data = await fs.readJson(filePath);
      const date = file.replace('tokens_', '').replace('.json', '');
      response += `\nДата: ${date}\n`;
      for (const [username, tokens] of Object.entries(data)) {
        response += `${username}: ${tokens.toLocaleString('ru-RU')} $S\n`;
      }
    }

    await ctx.reply(response);
  });
};