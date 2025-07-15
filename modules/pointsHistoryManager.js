const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

const HISTORY_PATH = path.join(__dirname, '../data/history.json');

// Зчитати історію з файлу
function readHistory() {
  if (!fs.existsSync(HISTORY_PATH)) return {};
  return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
}

// Зберегти історію у файл
function saveHistory(history) {
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
}

// Додати нові поінти до історії
function addDailyPoints(users) {
  const history = readHistory();
  const today = dayjs().format('YYYY-MM-DD');

  users.forEach(user => {
    const { nickname, sPoints } = user;

    if (!history[nickname]) {
      history[nickname] = [];
    }

    history[nickname].push({ date: today, sPoints });
  });

  saveHistory(history);
}

// Порахувати приріст поінтів за добу
function getDailyChanges() {
  const history = readHistory();
  const result = {};

  for (const [nickname, records] of Object.entries(history)) {
    if (records.length < 2) continue;

    const last = records[records.length - 1];
    const prev = records[records.length - 2];
    const diff = last.sPoints - prev.sPoints;

    result[nickname] = {
      latest: last,
      previous: prev,
      delta: diff
    };
  }

  return result;
}

module.exports = {
  addDailyPoints,
  getDailyChanges,
  readHistory
};
