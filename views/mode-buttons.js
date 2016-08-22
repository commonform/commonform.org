var assert = require('assert')
var html = require('yo-yo')

module.exports = modeButtons

function modeButtons (mode, send) {
  assert(typeof mode === 'string')
  assert(typeof send === 'function')
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
      <a
          href="/forms/new"
          class="new ${enableIf(mode === 'new')}"
          title="Click to create a new form."
      ></a>
      ${showReadModes ? modeButton('read', mode, send) : null}
      ${showReadModes ? modeButton('edit', mode, send) : null}
      ${showReadModes ? modeButton('comment', mode, send) : null}
      ${showReadModes ? modeButton('save', mode, send) : null}
      ${showReadModes ? modeButton('mail', mode, send) : null}
      ${showReadModes ? modeButton('settings', mode, send) : null}
    </div>
  `
}

function modeButton (mode, currentMode, send) {
  assert(typeof mode === 'string')
  assert(typeof currentMode === 'string')
  assert(typeof send === 'function')
  var enabled = mode === currentMode
  var title = enabled ? '' : 'Click to ' + mode + '.'
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
