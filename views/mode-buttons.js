var html = require('choo/html')

module.exports = modeButtons

function modeButtons (mode, send) {
  return html`
    <div class=modes>
      ${modeButton('read', mode, send)}
      ${modeButton('edit', mode, send)}
      ${modeButton('settings', mode, send)}
    </div>
  `
}

var symbols = {
  read: '\u2398', // next page symbol
  edit: '\u270d', // writing hand symbol
  settings: '\u2699' // gear symbol
}

function modeButton (mode, currentMode, send) {
  var enabled = mode === currentMode
  var title = (enabled ? 'Using ' : 'Click to use ') + mode + ' mode.'
  return html`
    <a
        title=${title}
        class=${enabled ? 'enabled' : 'disabled'}
        onclick=${function (event) {
          event.preventDefault()
          send('form:mode', {mode: mode})
        }}
      >${symbols[mode]}</a>
  `
}
