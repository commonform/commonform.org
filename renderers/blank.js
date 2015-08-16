function blank(state) {
  return require('virtual-dom/h')('span.blank', state.data.blank) }

module.exports = blank
