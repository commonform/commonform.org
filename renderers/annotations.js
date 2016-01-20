module.exports = annotations

var h = require('virtual-dom/h')

function annotations(annotations) {
  return h('aside', deduplicate(annotations).map(annotation)) }

function annotation(annotation) {
  return h('p.',
    { className: annotation.level },
    [ ( annotation.url ?
          ('a', { href: annotation.url }, annotation.message) :
          annotation.message ) ]) }

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
