module.exports = (bot) => {
  bot.help((ctx) => ctx.reply(`
📖 Доступные команды:

* /start — запустить бота
* /top — инструкция по пересылке топа от @yosoyass_bot
* /update — обновить данные по последнему топу и сохранить в историю
* /initial — внести начальные поинты вручную
* /send_points — отправить последний актуальный топ по поинтам в канал
* /clear — очистить всю историю и начальные данные
* /show_points — посмотреть историю поинтов
* /show_tokens — посмотреть историю токенов
* /help — показать эту справку
  `));
};
