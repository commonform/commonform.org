module.exports = annotations

var h = require('virtual-dom/h')
var improvePunctuation = require('../utility/improve-punctuation')

function annotations(annotations) {
  return h('aside', deduplicate(annotations).map(annotation)) }

function annotation(annotation) {
  var message = improvePunctuation(annotation.message)
  return h('p.',
    { className: annotation.level },
    [ ( annotation.url ?
          h('a', { href: annotation.url }, message) :
          message ) ]) }

function deduplicate(annotations) {
  return annotations
    .reduce(
      function(annotations, element) {
        return (
          annotations.some(
            function(otherElement) {
              return (
                ( element.source === otherElement.source ) &&
                ( element.message === otherElement.message ) &&
                ( element.url === otherElement.url ) ) }) ?
            annotations :
            annotations.concat(element) ) },
      [ ]) }
