module.exports = paragraph

var h = require('virtual-dom/h')
var predicates = require('commonform-predicate')
var renderText = require('./text')
var renderUse = require('./use')
var renderDefinition = require('./definition')
var renderBlank = require('./blank')
var renderDropZone = require('./drop-zone')
var renderReference = require('./reference')
var thunk = require('vdom-thunk')

function paragraph(state) {
  var blanks = state.blanks
  var data = state.data
  var emit = state.emit
  var offset = state.offset
  var path = state.path
  return [
    h('p.text',
      data.content
        .map(function(child, index) {
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
            return thunk(renderReference, child.reference) } })),
    renderDropZone({
      emit: emit,
      path: path.concat('content', ( offset + data.content.length )) }) ] }
