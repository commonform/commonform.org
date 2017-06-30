var assert = require('assert')
var h = require('../h')

module.exports = sidebar

function sidebar (mode, send) {
  assert(typeof mode === 'string')
  assert(typeof send === 'function')
  var showReadModes = (
    mode !== 'browse' &&
    mode !== 'search' &&
    mode !== 'none'
  )
  return h('div.modes', [
    h('a', {
      href: '/search',
      className: 'search ' + enableIf(mode === 'search'),
      title: 'Click to search forms.'
    }),
    h('a', {
      href: '/publishers',
      className: 'browse ' + enableIf(mode === 'browse'),
      title: 'Click to browse forms.'
    }),
    showReadModes ? readButton() : null,
    showReadModes ? toolbox(send) : null,
    h('a',
      {
        href: 'http://help.commonform.org',
        className: 'help disabled',
        rel: 'noreferrer',
        target: '_blank',
        title: 'Click for help.'
      }
    )
  ])
}

function toolbox (send) {
  assert(typeof send === 'function')
  var hidden = true

  return h('div.tools', {onclick: onClick}, [
    h('a.tools.disabled#toolsLink', {
      title: 'Click to open toolbox.'
    }),
    h('div.toolbox.closed#toolbox', [
      h('a.subscribe', {
        title: 'Subscribe via e-mail.',
        onclick: function (event) {
          event.preventDefault()
          event.stopPropagation()
          close()
          send('form:mode', 'mail')
        }
      }, 'Subscribe'),
      h('a.save', {
        title: 'Store with CommonForm.org',
        className: 'save',
        onclick: function (event) {
          event.preventDefault()
          event.stopPropagation()
          close()
          send('form:mode', 'save')
        }
      }, 'Store Online'),
      tool('simplify', 'Simplify Structure', close, send),
      tool('renameTerm', 'Rename Term', close, send),
      tool('renameHeading', 'Rename Heading', close, send),
      tool('identify', 'Mark Terms', close, send),
      tool('saveDOCX', 'Save DOCX', close, send),
      tool('saveProject', 'Save Project', close, send),
      tool('mail', 'E-Mail', close, send)
    ])
  ])

  function onClick (event) {
    if (hidden) {
      open()
    } else {
      close()
    }
  }

  function open () {
    var icon = getIcon()
    var box = getToolbox()
    icon.title = 'Click to close toolbox.'
    icon.className = 'tools enabled'
    box.className = 'toolbox open'
    hidden = false
  }

  function close () {
    var icon = getIcon()
    var box = getToolbox()
    icon.title = 'Click to open toolbox.'
    icon.className = 'tools disabled'
    box.className = 'toolbox closed'
    hidden = true
  }

  function getIcon () {
    return document.getElementById('toolsLink')
  }

  function getToolbox () {
    return document.getElementById('toolbox')
  }
}

var TOOLS = {
  saveProject: {
    title: 'Save project file.',
    action: 'form:download project'
  },
  saveDOCX: {
    title: 'Save Word file.',
    action: 'form:download docx'
  },
  mail: {
    title: 'E-Mail a link.',
    action: 'form:email'
  },
  renameTerm: {
    title: 'Rename a defined term.',
    action: 'form:rename term'
  },
  renameHeading: {
    title: 'Rename a heading.',
    action: 'form:rename heading'
  },
  simplify: {
    title: 'Simplify structure.',
    action: 'form:simplify'
  },
  markTerms: {
    title: 'Mark defined terms.',
    action: null
  },
  identify: {
    title: 'Identify terms and references.',
    action: 'form:identify'
  }
}

function tool (name, label, closeToolbox, send) {
  assert(typeof name === 'string')
  assert(TOOLS.hasOwnProperty(name))
  assert(typeof send === 'function')
  var tool = TOOLS[name]
  return h('a', {
    className: name,
    onclick: function (event) {
      event.preventDefault()
      event.stopPropagation()
      send(tool.action)
      closeToolbox()
    },
    title: tool.title
  }, label)
}

function readButton () {
  return h('a', {
    title: 'Reviewing form.',
    className: 'enabled read'
  })
}

function enableIf (argument) {
  return argument ? 'enabled' : 'disabled'
}
