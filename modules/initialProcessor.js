const fs = require('fs');
const path = require('path');
const topParser = require('./topParser');
const pointsHistory = require('./pointsHistoryManager');
const tokensHistory = require('./tokensHistoryManager');
const settings = require('../config/settings');

function processInitial() {
  try {
    console.log('📥 Читаємо origin.json...');
    const originPath = path.join(__dirname, '../data/origin.json');
    if (!fs.existsSync(originPath)) {
      console.error('❌ Файл origin.json не знайдено');
      return;
    }

    const origin = JSON.parse(fs.readFileSync(originPath, 'utf-8'));
    const { date, raw } = origin;

    console.log('📤 Парсимо /top...');
    const topUsers = topParser.parseTopMessage(raw);

    if (!topUsers || topUsers.length === 0) {
      console.error('❌ Не вдалося розпарсити дані з origin.json');
      return;
    }

    console.log('💾 Зберігаємо поінти...');
    topUsers.forEach(user => {
      pointsHistory.addDailyPoints([{ nickname: user.nickname, sPoints: user.sPoints }]);
    });

    console.log('💰 Розрахунок токенів...');
    const tokenHolders = topUsers.map(user => {
      const tokens = +(user.sPoints * settings.S_POINT_TO_TOKEN_RATIO);
      return { nickname: user.nickname, tokens };
    });

    console.log('💰 Зберігаємо токени...');
    tokensHistory.addDailyBalances(tokenHolders);

    console.log('✅ Початкові дані з origin.json оброблено і збережено.');
  } catch (err) {
    console.error('❌ Помилка при обробці даних:', err);
  }
}

module.exports = {
  processInitial
};
