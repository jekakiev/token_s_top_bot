const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const settings = require('./config/settings');

const bot = new TelegramBot(process.env.TOKEN, { polling: true });

let waitingFor = {}; // тимчасовий стан очікування

// ✅ /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '👋 Бот запущен. Дані зчитуються...');
});

// ✅ /clear (тільки адмін)
bot.onText(/\/clear/, (msg) => {
  const userId = msg.from.id;
  if (userId !== settings.ADMIN_ID) {
    return bot.sendMessage(msg.chat.id, '⛔️ У вас немає прав для цієї дії.');
  }

  const dataPath = path.join(__dirname, 'data');

  fs.writeFileSync(path.join(dataPath, 'history.json'), '{}');
  fs.writeFileSync(path.join(dataPath, 'balance.json'), '{}');
  fs.writeFileSync(path.join(dataPath, 'origin.json'), '{}');

  bot.sendMessage(msg.chat.id, '✅ Всі історії та початкові дані успішно очищені.');
});

// ✅ /initial (введення початкової дати та повідомлення)
bot.onText(/\/initial/, (msg) => {
  if (msg.from.id !== settings.ADMIN_ID) return;

  const chatId = msg.chat.id;
  waitingFor[msg.from.id] = { step: 'awaiting_date' };

  bot.sendMessage(chatId, '🗓 Введи дату у форматі YYYY-MM-DD (наприклад: 2025-07-14)');
});

// ✅ Обробка повідомлень для /initial
bot.on('message', (msg) => {
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
    const rawText = msg.text;

    if (!rawText || !rawText.includes('S-points')) {
      return bot.sendMessage(chatId, '❌ Повідомлення не схоже на відповідь команди /top. Спробуй ще раз.');
    }

    const dataToSave = {
      date: state.date,
      raw: rawText
    };

    const originPath = path.join(__dirname, 'data', 'origin.json');
    fs.writeFileSync(originPath, JSON.stringify(dataToSave, null, 2));

    // 🔥 одразу запускаємо обробку
    const { processInitial } = require('./modules/initialProcessor');
    processInitial();

    delete waitingFor[userId];

    return bot.sendMessage(chatId, '✅ Початкові дані збережено та оброблено');
  }
});

// ✅ /show_points — показати історію поінтів
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

// ✅ /show_tokens — показати історію токенів
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
