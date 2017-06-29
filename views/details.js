var assert = require('assert')
var collapsed = require('../html/collapsed')
var digestLink = require('./digest-link')
var improvePunctuation = require('../utilities/improve-punctuation')

module.exports = function (digest, annotationsArray, send) {
  assert(typeof digest === 'string')
  assert(Array.isArray(annotationsArray))
  assert(typeof send === 'function')
  var p = document.createElement('p')
  p.className = 'details'
  p.appendChild(digestLink(digest))
  p.appendChild(annotations(annotationsArray))
  return p
}

function annotations (array) {
  assert(Array.isArray(array))
  var aside = document.createElement('aside')
  deduplicate(array).forEach(function (element) {
    aside.appendChild(annotation(element))
  })
  return aside
}

function annotation (data) {
  assert(typeof data === 'object')
  assert(typeof data.message === 'string')
  var message = improvePunctuation(data.message)
  var p = document.createElement('p')
  p.className = data.level
  p.appendChild(annotationText(data.url, message))
  return p
}

function annotationText (url, message) {
  assert(typeof message === 'string')
  if (url) {
    var a = document.createElement('a')
    a.href = url
    a.appendChild(document.createTextNode(message))
    return a
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
