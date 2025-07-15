const settings = require('../config/settings');

function formatNumber(num) {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'М';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'К';
  }
  return num.toFixed(2);
}

function buildMessage(topHolders, priceUSD, todayDate, symbolMap = {}) {
  let header = `${todayDate} ${settings.TITLE}\n\n${settings.DISCLAIMER}\n\n${settings.SEASON_TITLE}\n\n`;

  const lines = topHolders.map((user, index) => {
    const { nickname, tokens, date } = user;
    const valueUSD = (tokens * priceUSD).toFixed(2);
    const formattedTokens = formatNumber(tokens);
    const approxValue = formatNumber(+valueUSD) + '$';

    const symbol = symbolMap[nickname] || '';
    const dateText = date ? ` - ${date}` : '';

    return `${index + 1}. ${symbol} ${nickname} — ${formattedTokens} $S (~${approxValue})${dateText}`;
  });

  return header + lines.join('\n');
}

module.exports = {
  buildMessage
};
