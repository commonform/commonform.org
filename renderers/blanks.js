var h = require('virtual-dom/h')

function blanks(state) {
  return h('div.blanks', 
    h('li', 
      Object.keys(state.analysis)
        .map(function(blank) {
          return h('span', blank) }))) }

module.exports = blanks
