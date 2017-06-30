var assert = require('assert')
var digestLink = require('./digest-link')
var h = require('../h')
var improvePunctuation = require('../utilities/improve-punctuation')

module.exports = function details (digest, annotationsArray, send) {
  assert(typeof digest === 'string')
  assert(Array.isArray(annotationsArray))
  assert(typeof send === 'function')
  return h('p.details', [
    digestLink(digest),
    annotations(annotationsArray)
  ])
}

function annotations (array) {
  assert(Array.isArray(array))
  return h('aside',
    deduplicate(array).map(function (element) {
      return annotation(element)
    })
  )
}

function annotation (data) {
  assert(typeof data === 'object')
  assert(typeof data.message === 'string')
  return h('p.' + data.level,
    annotationText(data.url, improvePunctuation(data.message))
  )
}

function annotationText (url, message) {
  assert(typeof message === 'string')
  if (url) {
    return h('a', {href: url}, message)
  } else {
    return document.createTextNode(message)
  }
}

function deduplicate (annotations) {
  assert(Array.isArray(annotations))
  return annotations.reduce(function (annotations, element) {
    return annotations.some(function (otherElement) {
      return element.source === otherElement.source &&
        element.message === otherElement.message &&
        element.url === otherElement.url
    })
      ? annotations
      : annotations.concat(element)
  }, [])
}
