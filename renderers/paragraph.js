module.exports = paragraph

var h = require('virtual-dom/h')
var predicates = require('commonform-predicate')
var renderText = require('./text')
var renderUse = require('./use')
var renderDefinition = require('./definition')
var renderBlank = require('./blank')
var renderReference = require('./reference')
var thunk = require('vdom-thunk')

function paragraph(state, index) {
  var blanks = state.blanks
  var data = state.data
  var diff = state.derived.diff
  var emit = state.emit
  var offset = state.offset
  var path = state.path

  function element(child) {
    if (predicates.text(child)) {
      return thunk(renderText, child) }
    else if (predicates.use(child)) {
      return thunk(renderUse, child.use) }
    else if (predicates.definition(child)) {
      return thunk(renderDefinition, child.definition) }
    else if (predicates.blank(child)) {
      var childPath = path
        .concat([ 'content', ( offset + index ) ])
      return renderBlank(
        { blanks: blanks,
          emit: emit,
          path: childPath }) }
    else if (predicates.reference(child)) {
      return thunk(renderReference, child.reference) } }

  return h('p.text',
    [ data.content
        .map(function(child, index) {
          console.log(diff)
          var diffs = (
            diff.hasOwnProperty(index) ?
              diff[index].annotations : [ ] )
          if (diffs.length > 0) {
            if (diffs[0].op === 'remove') {
              if (diffs.length > 1) {
                return [
                  h('ins', element(diffs[1].value, index)),
                  h('del', element(child, index)) ] }
              else {
                return h('del', element(child, index)) } }
            else { // insert only
              return h('ins', element(diffs[0].value, index)) } }
          else {
            return element(child, index) } }) ]) }
