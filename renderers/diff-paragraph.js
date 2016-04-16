module.exports = diffParagraph

var h = require('virtual-dom/h')
var predicates = require('commonform-predicate')
var renderUse = require('./use')
var renderReference = require('./reference')
var renderDefinition = require('./definition')

function diffParagraph(state) {
  var data = state.data
  return h('p.text',
    [ data.content
        .reduce(
          function(output, child) {
            var wrapper
            if (child.hasOwnProperty('inserted')) {
              wrapper = function wrapInIns(argument) {
                return h('ins', [ argument ] ) } }
            else if (child.hasOwnProperty('deleted')) {
              wrapper = function wrapInDel(argument) {
                return h('del', [ argument ] ) } }
            else {
              wrapper = doNotWrap }
            if (child.hasOwnProperty('word')) {
              if (wrapper === doNotWrap) {
                var last = output[output.length - 1]
                if (typeof last === 'string') {
                  output[output.length - 1] = ( last + child.word )
                  return output }
                else {
                  return output.concat(child.word) } }
              else {
                return output.concat(wrapper(h('span', child.word))) } }
            else if (predicates.use(child)) {
              return output.concat(wrapper(renderUse(child.use))) }
            else if (predicates.definition(child)) {
              return output.concat(wrapper(renderDefinition(child.definition))) }
            else if (predicates.blank(child)) {
              // TODO
              return output }
            else if (predicates.reference(child)) {
              return output.concat(renderReference(child.reference)) } },
          [ ]) ]) }

function doNotWrap(argument) {
  return argument }
