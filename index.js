const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const settings = require('./config/settings');

const bot = new TelegramBot(process.env.TOKEN, { polling: true });
let waitingFor = {}; // тимчасовий стан очікування

// ✅ /start
bot.on('message', async (msg) => {
  console.log('📩 Отримано повідомлення з текстом:', msg.text);
  console.log('➡️ Повне повідомлення:', msg);

  if (msg.text === '/start') {
    bot.sendMessage(msg.chat.id, '👋 Бот запущен. Дані зчитуються...');
  }
});

// ✅ /clear (тільки адмін)
bot.onText(/\/clear/, (msg) => {
  if (msg.from.id !== settings.ADMIN_ID) {
    return bot.sendMessage(msg.chat.id, '⛔️ У вас немає прав для цієї дії.');
  }

  const dataPath = path.join(__dirname, 'data');

  fs.writeFileSync(path.join(dataPath, 'history.json'), '{}');
  fs.writeFileSync(path.join(dataPath, 'balance.json'), '{}');
  fs.writeFileSync(path.join(dataPath, 'origin.json'), '{}');

  bot.sendMessage(msg.chat.id, '✅ Всі історії та початкові дані успішно очищені.');
});

// ✅ /initial
bot.onText(/\/initial/, (msg) => {
  if (msg.from.id !== settings.ADMIN_ID) return;

  const chatId = msg.chat.id;
  waitingFor[msg.from.id] = { step: 'awaiting_date' };
  bot.sendMessage(chatId, '🗓 Введи дату у форматі YYYY-MM-DD (наприклад: 2025-07-14)');
});

// ✅ /help
bot.onText(/\/help/, (msg) => {
  if (msg.from.id !== settings.ADMIN_ID) return;

  const helpText = `
📖 Доступні команди:

/start — запустити бота
/initial — внести початкову дату + повідомлення з /top
/clear — очистити всі історії і початкові дані
/show_points — подивитись історію поінтів
/show_tokens — подивитись історію токенів
/help — показати цю довідку
  `.trim();

  bot.sendMessage(msg.chat.id, helpText);
});

// ✅ /show_points
bot.onText(/\/show_points/, (msg) => {
  if (msg.from.id !== settings.ADMIN_ID) return;

  const historyPath = path.join(__dirname, 'data', 'history.json');
  if (!fs.existsSync(historyPath)) {
    return bot.sendMessage(msg.chat.id, '⚠️ Файл history.json не знайдено.');
  }

  const data = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
  const text = '📘 Points history:\n\n' + Object.entries(data).map(([nick, records]) => {
    return `👤 ${nick}:\n` + records.map(r => `📅 ${r.date}: ${r.sPoints}`).join('\n');
  }).join('\n\n');

  bot.sendMessage(msg.chat.id, text.length > 4096 ? text.slice(0, 4096) + '\n... (обрізано)' : text);
});

// ✅ /show_tokens
bot.onText(/\/show_tokens/, (msg) => {
  if (msg.from.id !== settings.ADMIN_ID) return;

  const balancePath = path.join(__dirname, 'data', 'balance.json');
  if (!fs.existsSync(balancePath)) {
    return bot.sendMessage(msg.chat.id, '⚠️ Файл balance.json не знайдено.');
  }

  const data = JSON.parse(fs.readFileSync(balancePath, 'utf-8'));
  const text = '💰 Token balances:\n\n' + Object.entries(data).map(([nick, records]) => {
    return `👤 ${nick}:\n` + records.map(r => `📅 ${r.date}: ${r.tokens}`).join('\n');
  }).join('\n\n');

  bot.sendMessage(msg.chat.id, text.length > 4096 ? text.slice(0, 4096) + '\n... (обрізано)' : text);
});

// ✅ обробка повідомлення (включаючи переслане з /top)
bot.on('message', async (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;

  if (!waitingFor[userId]) return;

  const state = waitingFor[userId];

  if (state.step === 'awaiting_date') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(msg.text)) {
      return bot.sendMessage(chatId, '❌ Невірний формат дати. Спробуй ще раз: YYYY-MM-DD');
    }

    waitingFor[userId] = { step: 'awaiting_message', date: msg.text };
    return bot.sendMessage(chatId, '📨 Тепер перешли повідомлення з /top (від бота @yosoyass_bot)');
  }

  if (state.step === 'awaiting_message') {
    const rawText = msg.text || msg.caption || '';
    console.log('📩 Отримано повідомлення з текстом:', rawText.slice(0, 80));

    if (!rawText || rawText.length < 20) {
      return bot.sendMessage(chatId, '❌ Повідомлення виглядає порожнім або непридатним. Спробуй переслати ще раз.');
    }

        try {
      const dataToSave = {
        date: state.date,
        raw: rawText
      };

      fs.writeFileSync(path.join(__dirname, 'data', 'origin.json'), JSON.stringify(dataToSave, null, 2));
      bot.sendMessage(chatId, '✅ Початкові дані збережено в origin.json');

      console.log('📦 Викликається processInitial з датою:', state.date);
      const { processInitial } = require('./modules/initialProcessor');
      await processInitial(state.date, rawText);

      bot.sendMessage(chatId, '📊 Дані оброблено: поінти збережено, токени розраховано.');
    } catch (err) {
      console.error('❌ Помилка при обробці processInitial:\n', err.stack || err);
      bot.sendMessage(chatId, `❌ Помилка при обробці: ${err.message || 'невідома помилка'}`);
    }


    delete waitingFor[userId];
  }
});
