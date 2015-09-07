var h = require('virtual-dom/h')

module.exports = openButton

function openButton(state) {
  var digest = state.digest
  return h('button.open',
    { onclick: function() {
        window.open('/forms/' + digest, '_blank') } },
    'Open') }
