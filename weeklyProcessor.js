// weeklyProcessor.js

const fs = require('fs');
const path = require('path');
const settings = require('./settings.json');
const { isNewNickname, saveNicknames } = require('./nicknameManager');

function generateWeeklyReport(weekAgoData, todayData) {
    const labels = settings.messages;
    const threshold = settings.anomalies.threshold;

    const today = new Date();
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dateFormat = { day: '2-digit', month: '2-digit' };
    const period = `${weekStart.toLocaleDateString('ru-RU', dateFormat)} – ${today.toLocaleDateString('ru-RU', dateFormat)}`;

    let report = `${labels.weekly_title.replace('%PERIOD%', period)}\n\n`;

    todayData.forEach(entry => {
        const old = weekAgoData.find(e => e.nickname === entry.nickname);
        const diff = old ? entry.score - old.score : 0;
        const anomalyMark = diff >= threshold ? ` ${labels.anomaly_label}` : '';
        const newMark = isNewNickname(entry.nickname) ? ` ${labels.new_label}` : '';
        const diffStr = diff === 0 ? `${labels.carryover_label}` : `+${diff}`;

        report += `${entry.rank}. ${entry.nickname.padEnd(12)} — ${entry.score} (${diffStr})${newMark}${anomalyMark}\n`;
    });

    saveNicknames(todayData);

    return report.trim();
}

module.exports = {
    generateWeeklyReport
};
