var html = require('choo/html')
var digestLink = require('./digest-link')
var improvePunctuation = require('../utilities/improve-punctuation')

module.exports = function (digest, annotationsArray, send) {
  return html`
    <p class=details>
      ${digestLink(digest, send)}
      ${annotations(annotationsArray)}
    </p>
  `
}

function annotations (array) {
  return html`<aside>${deduplicate(array).map(annotation)}</aside>`
}

function annotation (data) {
  var message = improvePunctuation(data.message)
  return html`
    <p class=${data.level}>${annotationText(data.url, message)}</p>
  `
}

function annotationText (url, message) {
  if (url) return html`<a href=${url}>${message}</a>`
  else return html`${message}`
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
  }, [])
}
