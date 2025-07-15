// dailyProcessor.js

const settings = require('./settings.json');
const { isNewNickname, saveNicknames } = require('./nicknameManager');

/**
 * Генерация текста ежедневного отчета
 * @param {Array} yesterdayData
 * @param {Array} todayData
 * @returns {string}
 */
function generateDailyReport(yesterdayData, todayData) {
    const anomalyThreshold = settings.anomalies.threshold;
    const labels = settings.messages;
    const today = new Date().toLocaleDateString('ru-RU', { timeZone: settings.timezone });

    let report = `${labels.daily_title.replace('%DATE%', today)}\n\n`;

    todayData.forEach(todayEntry => {
        const yest = yesterdayData.find(y => y.nickname === todayEntry.nickname);
        const diff = yest ? todayEntry.score - yest.score : 0;
        const isAnomaly = diff >= anomalyThreshold;
        const isNew = isNewNickname(todayEntry.nickname);

        const diffStr = diff === 0 ? `${labels.carryover_label}` : `+${diff}`;
        const anomalyMark = isAnomaly ? ` ${labels.anomaly_label}` : '';
        const newMark = isNew ? ` ${labels.new_label}` : '';

        report += `${todayEntry.rank}. ${todayEntry.nickname.padEnd(12)} — ${todayEntry.score} (${diffStr})${newMark}${anomalyMark}\n`;
    });

    // Обновляем список никнеймов
    saveNicknames(todayData);

    return report.trim();
}

module.exports = {
    generateDailyReport
};
