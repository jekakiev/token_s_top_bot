// nicknameManager.js

const fs = require('fs');
const path = require('path');

const nicknamesPath = path.join(__dirname, 'data/nicknames.json');

function loadNicknames() {
    if (!fs.existsSync(nicknamesPath)) return [];
    return JSON.parse(fs.readFileSync(nicknamesPath, 'utf-8'));
}

function saveNicknames(currentList) {
    const existing = new Set(loadNicknames());
    currentList.forEach(n => existing.add(n.nickname));
    fs.writeFileSync(nicknamesPath, JSON.stringify([...existing], null, 2), 'utf-8');
}

function isNewNickname(nickname) {
    const known = loadNicknames();
    return !known.includes(nickname);
}

module.exports = {
    loadNicknames,
    saveNicknames,
    isNewNickname
};
