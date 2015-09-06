var h  = require('virtual-dom/h')

function textarea(state) {
  return h('textarea',
    { value: state.value }) }

module.exports = textarea
