const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

const BALANCE_PATH = path.join(__dirname, '../data/balance.json');

// Зчитати історію балансів
function readBalances() {
  if (!fs.existsSync(BALANCE_PATH)) return {};
  return JSON.parse(fs.readFileSync(BALANCE_PATH, 'utf-8'));
}

// Зберегти оновлену історію
function saveBalances(balances) {
  fs.writeFileSync(BALANCE_PATH, JSON.stringify(balances, null, 2));
}

// Додати нові баланси (якщо не було аномалії)
function addDailyBalances(calculatedBalances, anomalies = []) {
  const balances = readBalances();
  const today = dayjs().format('YYYY-MM-DD');

  calculatedBalances.forEach(({ nickname, tokens }) => {
    if (anomalies.includes(nickname)) {
      console.log(`⛔️ Пропущено ${nickname} — аномалія`);
      return;
    }

    if (!balances[nickname]) {
      balances[nickname] = [];
    }

    balances[nickname].push({ date: today, tokens });
  });

  saveBalances(balances);
}

// Отримати останній запис по кожному користувачу
function getLastValidBalances() {
  const balances = readBalances();
  const result = [];

  for (const [nickname, records] of Object.entries(balances)) {
    if (records.length === 0) continue;
    const last = records[records.length - 1];
    result.push
