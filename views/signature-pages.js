var assert = require('assert')
var capitalize = require('capitalize')
var html = require('yo-yo')
var clone = require('../utilities/clone')
var emptySignaturePage = require('../data/empty-signature-page')
var input = require('./input')

module.exports = function (pages, send) {
  assert(Array.isArray(pages))
  assert(typeof send === 'function')
  return html`
    <div class=signaturePages>
      <p class=endOfPage>
        ${
          pages.length > 0
            ? pages.length === 1
              ? '[Signature Page Follows]'
              : '[Signature Pages Follow]'
            : null
        }
      </p>
      ${pages.map(function (element, index) {
        return signaturePage(element, [index], send)
      })}
      <p>
        <button
            onclick=${function (event) {
              event.preventDefault()
              send(
                'form:signatures',
                {
                  operation: 'push',
                  key: [],
                  value: newPage()
                }
              )
            }}
          >Add Signature Page</button>
      </p>
    </div>
  `
}

var optional = ['date', 'email', 'address']

function signaturePage (page, path, send) {
  var entities = page.entities
  var information = page.information || []

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

  return html`
    <div class=page>
      <p class=header>${inputFor('header', 'Signature Page Header')}</p>
      <p>${inputFor('term', 'Party Defined Term')}:</p>
      ${entitiesParagraphs(entities, path.concat('entities'), send)}
      <p>By:</p>
      <p>Name: ${inputFor('name')}</p>
      ${
        entities.length > 0
          ? (function () {
            var lastIndex = entities.length - 1
            var byPath = path.concat('entities', lastIndex, 'by')
            return html`
              <p>Title:
                ${input(
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
                  })
                }
              </p>`
          })()
          : null
      }
      ${
        optional.map(function (text) {
          var display = text === 'email'
            ? 'E-Mail'
            : capitalize(text)
          if (information.indexOf(text) > -1) {
            return html`<p>${display}:`
          } else {
            return html`
              <p>
                <button
                    onclick=${
                      function (event) {
                        event.preventDefault()
                        var infoPath = path.concat('information')
                        var newValue = optional.filter(
                          function (filtering) {
                            return (
                              filtering === text ||
                              information.indexOf(filtering) > -1
                            )
                          }
                        )
                        send(
                          'form:signatures',
                          {
                            operation: 'set',
                            key: infoPath,
                            value: newValue
                          }
                        )
                      }
                    }
                >Require ${display}</button>
              </p>
            `
          }
        })
      }
      <p>
        <button
            onclick=${
              function (event) {
                event.preventDefault()
                send('form:signatures', {
                  operation: 'splice',
                  key: path
                })
              }
            }
          >Delete this Signature Page
        </button>
      </p>
  `
}

function newPage () {
  return clone(emptySignaturePage)
}

function entitiesParagraphs (entities, path, send) {
  entities = entities || []
  return html`
    <div class=entities>
      ${
        entities.map(function (entity, index, entities) {
          return signatureEntity({
            by: index > 0 ? entities[index - 1].by : false,
            byPath: path.concat(index - 1, 'by'),
            entity: entity,
            needsBy: index > 0,
            path: path.concat(index)
          },
          send
          )
        })
      }
      <p>
        <button
            onclick=${
              function (event) {
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
            }
          >Add Entity</button>
      </p>
    </div>
  `
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

  return html`
    <p class=entity>
      ${needsBy ? 'By:' : null}
      ${inputFor('name', 'Name')}, a
      ${inputFor('jurisdiction', 'Jurisdiction')}
      ${inputFor('form', 'Entity Type')}
      ${needsBy ? 'its' : null}
      ${
        needsBy
          ? (function () {
            var by = state.by
            var byPath = state.byPath
            return input(
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
            )
          })()
          : null
      }
      <button
          onclick=${
            function (event) {
              event.preventDefault()
              send('form:signatures', {
                operation: 'splice',
                key: path
              })
            }
          }
        >Delete Entity</button>
    </p>
  `
}
