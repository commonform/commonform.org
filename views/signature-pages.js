var assert = require('assert')
var capitalize = require('capitalize')
var classnames = require('classnames')
var clone = require('../utilities/clone')
var emptySignaturePage = require('../data/empty-signature-page')
var h = require('hyperscript')
var input = require('./input')

module.exports = function signaturePages (pages, send) {
  assert(Array.isArray(pages))
  assert(typeof send === 'function')
  var newPageCount = pages.reduce(function (count, page) {
    return page.samePage ? count : count + 1
  }, 0)

  return h('div.signaturePages',
    h('p.endOfPage', [
      newPageCount === 0
        ? null
        : pages.length === 1
          ? '[Signature Page Follows]'
          : '[Signature Pages Follow]'
    ]),
    pages.map(function (element, index) {
      return signaturePage(element, [index], send)
    }),
    h('p',
      h('button', {onclick: function (event) {
        event.preventDefault()
        send(
          'form:signatures',
          {
            operation: 'push',
            key: [],
            value: newPage()
          }
        )
      }}, 'Add Signature Page')
    )
  )
}

var OPTIONAL_INFORMATION = ['date', 'email', 'address']

function signaturePage (page, path, send) {
  var entities = page.entities
  var information = page.information

  function updateValue (key, value) {
    var keyPath = path.concat(key)
    if (value.length > 0) {
      send(
        'form:signatures',
        {
          operation: 'set',
          key: keyPath,
          value: value
        }
      )
    } else {
      send(
        'form:signatures',
        {
          operation: 'delete',
          key: keyPath
        }
      )
    }
  }

  function inputFor (key, placeholder) {
    return input(
      page[key] || '',
      function (value) {
        updateValue(key, value)
      },
      function () {
        updateValue(key, '')
      },
      placeholder
    )
  }

  var classes = classnames('page', {samePage: page.samePage})

  return h('div.' + classes,
    h('p.samePage',
      h('input', {
        type: 'checkbox',
        onclick: function () {
          send('form:signatures', {
            operation: 'toggle',
            key: path.concat('samePage')
          })
        },
        checked: page.samePage
      }),
      'Same page'
    ),
    h('p.header', inputFor('header', 'Signature Page Header')),
    entitiesParagraphs(entities, path.concat('entities'), send),
    h('p', 'By:'),
    h('p', 'Name:', inputFor('name')),
    entities.length > 0
      ? (function () {
        var lastIndex = entities.length - 1
        var byPath = path.concat('entities', lastIndex, 'by')
        var p = document.createElement('p')
        p.appendChild(document.createTextNode('Title: '))
        p.appendChild(input(
          entities[lastIndex].by,
          function (value) {
            send(
              'form:signatures',
              {
                operation: 'set',
                key: byPath,
                value: value
              }
            )
          },
          function () {
            send(
              'form:signatures',
              {
                operation: 'delete',
                key: byPath
              }
            )
          }
        ))
        return p
      })()
      : null,
    OPTIONAL_INFORMATION.map(function (text) {
      var display = text === 'email'
        ? 'E-Mail'
        : capitalize(text)
      if (information.indexOf(text) !== -1) {
        return h('p', display + ':')
      } else {
        return h('p',
          h('button', {
            onclick: function (event) {
              event.preventDefault()
              // TODO: Fix multiple information items selected
              send('form:signatures', {
                operation: 'push',
                key: path.concat('information'),
                value: text
              })
            }
          }, 'Require ' + display)
        )
      }
    }),
    h('p',
      h('button', {
        onclick: function (event) {
          event.preventDefault()
          send('form:signatures', {
            operation: 'splice',
            key: path
          })
        }
      }, 'Delete this Signature Page')
    )
  )
}

function newPage () {
  return clone(emptySignaturePage)
}

function entitiesParagraphs (entities, path, send) {
  entities = entities || []
  var div = document.createElement('div')
  div.className = 'entities'
  entities.forEach(function (entity, index, entities) {
    div.appendChild(
      signatureEntity({
        by: index > 0 ? entities[index - 1].by : false,
        byPath: path.concat(index - 1, 'by'),
        entity: entity,
        needsBy: index > 0,
        path: path.concat(index)
      }, send)
    )
  })
  var p = document.createElement('p')
  var button = document.createElement('button')
  button.onclick = function (event) {
    event.preventDefault()
    send(
      'form:signatures',
      {
        operation: 'push',
        key: path,
        value: {}
      }
    )
  }
  button.appendChild(document.createTextNode('Add Entity'))
  div.appendChild(p)
  return div
}

function signatureEntity (state, send) {
  var entity = state.entity
  var needsBy = state.needsBy
  var path = state.path

  function updateValue (key, value) {
    var keyPath = path.concat(key)
    if (value.length > 0) {
      send(
        'form:signatures',
        {
          operation: 'set',
          key: keyPath,
          value: value
        }
      )
    } else {
      send(
        'form:signatures',
        {
          operation: 'delete',
          key: keyPath
        }
      )
    }
  }

  function inputFor (key, placeholder) {
    return input(
      entity[key] || '',
      function (value) {
        updateValue(key, value)
      },
      function () {
        updateValue(key, '')
      },
      placeholder
    )
  }

  var p = document.createElement('p')
  p.className = 'entity'
  if (needsBy) {
    p.appendChild(document.createTextNode('By:'))
  }
  p.appendChild(inputFor('name', 'Name'))
  p.appendChild(document.createTextNode('a'))
  p.appendChild(inputFor('jurisdiction', 'Jurisdiction'))
  p.appendChild(inputFor('form', 'Entity Type'))
  if (needsBy) {
    p.appendChild(document.createTextNode('its'))
    var by = state.by
    var byPath = state.byPath
    p.appendChild(input(
      by,
      function (value) {
        send(
          'form:signatures',
          {
            operation: 'set',
            key: byPath,
            value: value
          }
        )
      },
      function () {
        send(
          'form:signatures',
          {
            operation: 'delete',
            key: byPath
          }
        )
      },
      'Role'
    ))
  }
  var button = document.createElement('button')
  button.onclick = function (event) {
    event.preventDefault()
    send('form:signatures', {
      operation: 'splice',
      key: path
    })
  }
  button.appendChild(document.createTextNode('Delete Entity'))
  p.appendChild(button)
  return p
}
