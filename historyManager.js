// historyManager.js

const fs = require('fs');
const path = require('path');
const settings = require('./settings.json');

function saveHistory(todayData) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const historyDir = path.join(__dirname, 'data/history');

    if (!fs.existsSync(historyDir)) {
        fs.mkdirSync(historyDir, { recursive: true });
    }

    const filePath = path.join(historyDir, `${today}.json`);
    fs.writeFileSync(filePath, JSON.stringify(todayData, null, 2), 'utf-8');
}

function saveAnomalies(yesterdayData, todayData) {
    const anomalies = [];
    const threshold = settings.anomalies.threshold;

    todayData.forEach(today => {
        const yest = yesterdayData.find(y => y.nickname === today.nickname);
        if (!yest) return;
        const diff = today.score - yest.score;
        if (diff >= threshold) {
            anomalies.push({
                nickname: today.nickname,
                diff,
                timestamp: new Date().toISOString()
            });
        }
    });

    if (anomalies.length === 0) return;

    const anomalyPath = path.join(__dirname, 'data/anomalies.json');
    let allAnomalies = [];
    if (fs.existsSync(anomalyPath)) {
        allAnomalies = JSON.parse(fs.readFileSync(anomalyPath, 'utf-8'));
    }

    allAnomalies.push(...anomalies);
    fs.writeFileSync(anomalyPath, JSON.stringify(allAnomalies, null, 2), 'utf-8');

    return anomalies;
}

module.exports = {
    saveHistory,
    saveAnomalies
};
