module.exports = diffHeading

var h = require('virtual-dom/h')
var renderWord = require('./word')

function diffHeading(state) {
  var heading = state.heading
  return h('p.heading',
    { id: ( 'Heading ' +
            heading
              .map(function(word) {
                return word.word })
              .join('') ) },
    heading.map(renderWord)) }
