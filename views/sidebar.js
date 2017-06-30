var assert = require('assert')

module.exports = sidebar

function sidebar (mode, send) {
  assert(typeof mode === 'string')
  assert(typeof send === 'function')
  var showReadModes = (
    mode !== 'browse' &&
    mode !== 'search' &&
    mode !== 'none'
  )
  var div = document.createElement('div')
  div.className = 'modes'

  var search = document.createElement('a')
  search.href = '/search'
  search.className = 'search ' + enableIf(mode === 'search')
  search.title = 'Click to search forms.'
  div.appendChild(search)

  var publishers = document.createElement('a')
  publishers.href = '/publishers'
  publishers.className = 'browse ' + enableIf(mode === 'browse')
  publishers.title = 'Click to browse forms.'
  div.appendChild(publishers)

  if (showReadModes) {
    div.appendChild(readButton())
    div.appendChild(toolbox(send))
  }

  var help = document.createElement('a')
  help.href = 'http://help.commonform.org'
  help.className = 'help disabled'
  help.setAttribute('rel', 'noreferrer')
  help.setAttribute('target', '_blank')
  help.title = 'Click for help.'
  div.appendChild(help)

  return div
}

function toolbox (send) {
  assert(typeof send === 'function')
  var hidden = true

  var div = document.createElement('div')
  div.className = 'tools'
  div.onclick = onClick

  var tools = document.createElement('a')
  tools.id = 'toolsLink'
  tools.title = 'Click to open toolbox.'
  tools.className = 'tools disabled'
  div.appendChild(tools)

  var box = document.createElement('div')
  box.id = 'toolbox'
  box.className = 'toolbox closed'

  var subscribe = document.createElement('a')
  subscribe.title = 'Subscribe via e-mail.'
  subscribe.className = 'subscribe'
  subscribe.onclick = function (event) {
    event.preventDefault()
    event.stopPropagation()
    close()
    send('form:mode', 'mail')
  }
  subscribe.appendChild(document.createTextNode('Subscribe'))
  box.appendChild(subscribe)

  var save = document.createElement('a')
  save.title = 'Store with CommonForm.org'
  save.className = 'save'
  save.onclick = function (event) {
    event.preventDefault()
    event.stopPropagation()
    close()
    send('form:mode', 'save')
  }
  save.appendChild(document.createTextNode('Store Online'))
  box.appendChild(save)

  box.appendChild(tool('simplify', 'Simplify Structure', close, send))
  box.appendChild(tool('renameTerm', 'Rename Term', close, send))
  box.appendChild(tool('renameHeading', 'Rename Heading', close, send))
  box.appendChild(tool('identify', 'Mark Terms', close, send))
  box.appendChild(tool('saveDOCX', 'Save DOCX', close, send))
  box.appendChild(tool('saveProject', 'Save Project', close, send))
  box.appendChild(tool('mail', 'E-Mail', close, send))

  div.appendChild(box)

  return div

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
  var a = document.createElement('a')
  a.className = name
  a.onclick = function (event) {
    event.preventDefault()
    event.stopPropagation()
    send(tool.action)
    closeToolbox()
  }
  a.title = tool.title
  a.appendChild(document.createTextNode(label))
  return a
}

function readButton () {
  var a = document.createElement('a')
  a.title = 'Reviewing form.'
  a.className = 'enabled read'
  return a
}

function enableIf (argument) {
  return argument ? 'enabled' : 'disabled'
}
