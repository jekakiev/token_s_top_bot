// modules/history.js

const fs = require('fs');
const path = require('path');
const historyFile = path.join(__dirname, '../data/history.json');

// Зберігає топ за день
function saveDayTop(date, topList) {
    let history = {};
    if (fs.existsSync(historyFile)) {
        history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    }
    history[date] = topList;
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
}

// Отримати історію
function getHistory() {
    if (!fs.existsSync(historyFile)) return {};
    return JSON.parse(fs.readFileSync(historyFile, 'utf8'));
}

module.exports = { saveDayTop, getHistory };
