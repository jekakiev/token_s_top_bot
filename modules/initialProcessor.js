const fs = require('fs');
const path = require('path');

function processInitial() {
  console.log('🔧 processInitial() запущено...');

  try {
    const originPath = path.join(__dirname, '../data/origin.json');
    const historyPath = path.join(__dirname, '../data/history.json');
    const balancePath = path.join(__dirname, '../data/balance.json');

    const rawData = JSON.parse(fs.readFileSync(originPath, 'utf-8'));
    const lines = rawData.raw.split('\n').map(line => line.trim()).filter(Boolean);
    const date = rawData.date;

    console.log('📅 Дата з origin:', date);
    console.log('📄 Перших 3 рядки тексту:', lines.slice(0, 3));

    const startIndex = lines.findIndex(line => line.includes('📉 S-points за 1К S:'));
    if (startIndex === -1) throw new Error('Не знайдено початку списку з очками');

    const topUsers = [];
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^\d+\.\s(.+?)\sS-points:\s(\d+)/);
      if (match) {
        const name = match[1].trim();
        const sPoints = parseInt(match[2].trim());
        topUsers.push({ name, sPoints });
      }
    }

    if (topUsers.length === 0) throw new Error('Жодного юзера не знайдено');

    const tokensPerPoint = 0.1;
    const balance = {};
    const history = {};

    for (const user of topUsers) {
      const tokens = +(user.sPoints * tokensPerPoint).toFixed(3);
      balance[user.name] = [{ date, tokens }];
      history[user.name] = [{ date, sPoints: user.sPoints }];
    }

    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
    fs.writeFileSync(balancePath, JSON.stringify(balance, null, 2));

    console.log('✅ Дані збережено в history.json і balance.json');
  } catch (err) {
    console.error('❌ ПОМИЛКА В processInitial:', err);
    throw err; // кидаємо далі, щоб побачити в бота
  }
}

module.exports = { processInitial };
