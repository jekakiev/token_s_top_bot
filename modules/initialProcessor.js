const fs = require('fs');
const path = require('path');

const ORIGIN_FILE = path.join(__dirname, '../data/origin.json');

/**
 * Парсить повідомлення з ботом @yosoyass_bot, зберігає в origin.json,
 * потім повертає true або кидає помилку.
 */
async function processInitial(messageText, selectedDate, bot, chatId) {
  console.log('🔧 processInitial() запущено...');

  const lines = messageText.split('\n').map(line => line.trim()).filter(line => line);
  console.log('📅 Дата з origin:', selectedDate);
  console.log('📄 Перших 3 рядки тексту:', lines.slice(0, 3));

  // Знаходимо індекс рядка, де починається список гравців
  const startIndex = lines.findIndex(line =>
    /S-points\s+за\s+1[КK]\s+S/i.test(line)
  );

  if (startIndex === -1) {
    throw new Error('Не знайдено початку списку з очками');
  }

  const playerLines = lines.slice(startIndex + 1)
    .filter(line => /^\d+\./.test(line.trim())); // рядки з номерами

  const players = playerLines.map(line => {
    const match = line.match(/^\d+\.\s*(.*?)\s+S-points:\s*(\d+)/);
    if (!match) return null;

    const name = match[1].trim();
    const points = parseInt(match[2], 10);
    return { name, points };
  }).filter(Boolean);

  if (players.length === 0) {
    throw new Error('Не вдалося знайти жодного гравця в списку');
  }

  const dataToSave = {
    date: selectedDate,
    raw: messageText,
    players
  };

  fs.writeFileSync(ORIGIN_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  console.log('✅ Дані успішно збережено в origin.json');

  await bot.sendMessage(chatId, `✅ Дані за ${selectedDate} успішно оброблено і збережено.`);
}

module.exports = { processInitial };
