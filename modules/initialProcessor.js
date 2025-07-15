const fs = require('fs');
const path = require('path');

/**
 * Парсить сирий текст і витягує список топ-20 учасників з поінтами
 * @param {string} raw
 * @returns {Array<{nick: string, sPoints: number}>}
 */
function parseTop(raw) {
  const regex = /\d+\.\s+(.+?)\s+S-points:\s*([\d\s]+)/g;
  const top = [];
  let match;

  while ((match = regex.exec(raw)) !== null) {
    const nick = match[1].trim();
    const sPoints = parseInt(match[2].replace(/\s/g, ''), 10);
    if (!isNaN(sPoints)) {
      top.push({ nick, sPoints });
    }
  }

  return top;
}

/**
 * Зберігає поінти у файл `history.json`
 * @param {string} date
 * @param {Array} topList
 */
function updateHistory(date, topList) {
  const historyPath = path.join(__dirname, '../data/history.json');
  let history = {};

  if (fs.existsSync(historyPath)) {
    history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
  }

  for (const { nick, sPoints } of topList) {
    if (!history[nick]) history[nick] = [];
    history[nick].push({ date, sPoints });
  }

  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
}

/**
 * Розраховує токени на основі змін поінтів і зберігає у `balance.json`
 * @param {string} date
 * @param {Array} topList
 */
function updateBalance(date, topList) {
  const historyPath = path.join(__dirname, '../data/history.json');
  const balancePath = path.join(__dirname, '../data/balance.json');
  const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
  let balance = {};

  if (fs.existsSync(balancePath)) {
    balance = JSON.parse(fs.readFileSync(balancePath, 'utf-8'));
  }

  for (const { nick, sPoints } of topList) {
    const records = history[nick] || [];
    const prev = records.length >= 2 ? records[records.length - 2].sPoints : 0;
    const delta = sPoints - prev;

    const tokens = delta >= 0 ? Math.round((delta * 10) / 1000 * 100) / 100 : 0;

    if (!balance[nick]) balance[nick] = [];
    balance[nick].push({ date, tokens });
  }

  fs.writeFileSync(balancePath, JSON.stringify(balance, null, 2));
}

/**
 * Основна функція, яка приймає дату та сирий текст
 * @param {string} date
 * @param {string} rawText
 */
async function processInitial(date, rawText) {
  console.log('🟡 Початок обробки...');
  const topList = parseTop(rawText);

  console.log('📋 Розпарсено топ:', topList);
  updateHistory(date, topList);
  console.log('📘 Історія оновлена');
  updateBalance(date, topList);
  console.log('💰 Баланси оновлені');
  console.log('✅ Успішно завершено обробку.');
}

module.exports = {
  processInitial
};
