// modules/topParser.js

function parseTopList(text) {
    // Витягуємо тільки строки виду "1. Nickname. S-points: 12345"
    const lines = text.split('\n');
    const topLines = lines.filter(line => /\d+\..*S-points:/.test(line));
    return topLines;
}

function parseUserPoints(line) {
    // Парсить одну строку топу (з emoji)
    // Наприклад: "🍏1. Smash 🔥. S-points: 532188"
    const match = line.match(/^\D*(\d+)\.\s*(.+?)\s*S-points:\s*([0-9]+)/);
    if (!match) return null;
    return {
        place: Number(match[1]),
        nick: match[2].replace(/🔥|\./g, '').trim(), // чистимо зайве, якщо треба
        points: Number(match[3])
    };
}

module.exports = { parseTopList, parseUserPoints };