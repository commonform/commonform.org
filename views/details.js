var assert = require('assert')
var collapsed = require('../html/collapsed')
var digestLink = require('./digest-link')
var improvePunctuation = require('../utilities/improve-punctuation')

module.exports = function (digest, annotationsArray, send) {
  assert(typeof digest === 'string')
  assert(Array.isArray(annotationsArray))
  assert(typeof send === 'function')
  return collapsed`
    <p class=details>
      ${digestLink(digest)}
      ${annotations(annotationsArray)}
    </p>
  `
}

function annotations (array) {
  assert(Array.isArray(array))
  return collapsed`<aside>${deduplicate(array).map(annotation)}</aside>`
}

function annotation (data) {
  assert(typeof data === 'object')
  assert(typeof data.message === 'string')
  var message = improvePunctuation(data.message)
  return collapsed`
    <p class=${data.level}>${annotationText(data.url, message)}</p>
  `
}

function annotationText (url, message) {
  assert(typeof message === 'string')
  if (url) return collapsed`<a href=${url}>${message}</a>`
  else return collapsed`${message}`
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
