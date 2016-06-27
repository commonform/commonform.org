var choo = require('choo')
var improvePunctuation = require('../improve-punctuation')
var digestLink = require('./digest-link')

module.exports = function (digest, annotationsArray, send) {
  return choo.view`
    <p class=details>
      ${digestLink(digest, send)}
      ${annotations(annotationsArray)}
    </p>
  `
}

function annotations (array) {
  return choo.view`<aside>${deduplicate(array).map(annotation)}</aside>`
}

function annotation (data) {
  var message = improvePunctuation(data.message)
  return choo.view`<p class=${data.level}>${annotationText(data.url, message)}</p>`
}

function annotationText (url, message) {
  if (url) return choo.view`<a href=${url}>${message}</a>`
  else return choo.view`${message}`
}

function deduplicate (annotations) {
  return annotations.reduce(function (annotations, element) {
    return annotations.some(function (otherElement) {
      return element.source === otherElement.source &&
        element.message === otherElement.message &&
        element.url === otherElement.url
    })
      ? annotations
      : annotations.concat(element)
  }, [ ])
}
