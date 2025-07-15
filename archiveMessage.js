// archiveMessage.js

const settings = require('./settings.json');

/**
 * Генерирует архивное сообщение перед выплатами
 * @param {Array} todayData - текущий список топ-участников
 * @returns {string}
 */
function generateArchiveMessage(todayData) {
    const titleTemplate = settings.messages.archive_title;
    const date = new Date().toLocaleDateString('ru-RU', { timeZone: settings.timezone });
    const title = titleTemplate.replace('%DATE%', date);

    let message = `${title}\n\n`;

    todayData.forEach(entry => {
        message += `${entry.rank}. ${entry.nickname.padEnd(12)} — ${entry.score}\n`;
    });

    return message.trim();
}

module.exports = {
    generateArchiveMessage
};
