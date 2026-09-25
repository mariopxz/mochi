function normalizeSpaces(str) {
  return str.trim().replace(/\s+/g, ' ');
}

function removeAllSpaces(str) {
  return str.replace(/\s+/g, '');
}

function scapeHtml (str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

module.exports = { normalizeSpaces, removeAllSpaces, scapeHtml };