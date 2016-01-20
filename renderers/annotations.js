module.exports = annotations

var h = require('virtual-dom/h')

function annotations(annotations) {
  return h('aside', annotations.map(annotation)) }

function annotation(annotation) {
  return h('p.',
    { className: annotation.level },
    [ ( annotation.url ?
          h('a', { href: annotation.url }, annotation.message) :
          annotation.message ) ]) }
