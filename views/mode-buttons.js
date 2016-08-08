var html = require('yo-yo')

module.exports = modeButtons

function modeButtons (mode, send) {
  var showReadModes = mode !== 'browse' && mode !== 'search'
  return html`
    <div class=modes>
      <a
          href="/search"
          class=${enableIf(mode === 'search')}
          title="Click to search forms."
      >${symbols.search}</a>
      <a
          href="/publishers"
          class=${enableIf(mode === 'browse')}
          title="Click to browse forms."
      >${symbols.browse}</a>
      ${showReadModes ? modeButton('read', mode, send) : null}
      ${showReadModes ? modeButton('edit', mode, send) : null}
    </div>
  `
}

var symbols = {
  search: '\u26cf', // pick
  browse: '\u269f', // three lines converging left
  read: '\u2398', // next page symbol
  edit: '\u270D', // writing hand symbol
  compare: '\u2260', // not-equal
  comment: '\u275e', // right double quote
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
          send('form:mode', mode)
        }}
      >${symbols[mode]}</a>
  `
}

function enableIf (argument) {
  return argument ? 'enabled' : 'disabled'
}
