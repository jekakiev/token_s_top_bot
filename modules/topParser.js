function parseTopMessage(text) {
  const lines = text.split('\n');
  const topLines = lines.filter(line => line.match(/^\D*\d{1,2}\./));

  const topUsers = topLines.map((line) => {
    const match = line.match(/(\d{1,2})\.\s+(.+?)\s+S-points:\s+([\d]+)/);
    if (!match) return null;

    return {
      position: parseInt(match[1]),
      nickname: match[2].trim(),
      sPoints: parseInt(match[3])
    };
  }).filter(Boolean);

  return topUsers;
}

module.exports = {
  parseTopMessage
};
