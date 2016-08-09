var html = require('yo-yo')

module.exports = modeButtons

function modeButtons (mode, send) {
  var showReadModes = mode !== 'browse' && mode !== 'search'
  return html`
    <div class=modes>
      <a
          href="/search"
          class="search ${enableIf(mode === 'search')}"
          title="Click to search forms."
      ></a>
      <a
          href="/publishers"
          class="browse ${enableIf(mode === 'browse')}"
          title="Click to browse forms."
      ></a>
      ${showReadModes ? modeButton('read', mode, send) : null}
      ${showReadModes ? modeButton('edit', mode, send) : null}
      ${showReadModes ? modeButton('save', mode, send) : null}
    </div>
  `
}

function modeButton (mode, currentMode, send) {
  var enabled = mode === currentMode
  var title = (enabled ? 'Using ' : 'Click to use ') + mode + ' mode.'
  return html`
    <a
        title=${title}
        class="${mode} ${enabled ? 'enabled' : 'disabled'}"
        onclick=${function (event) {
          event.preventDefault()
          send('form:mode', mode)
        }}
      ></a>
  `
}

function enableIf (argument) {
  return argument ? 'enabled' : 'disabled'
}
