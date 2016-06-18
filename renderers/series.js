module.exports = series

var get = require('keyarray').get
var renderDropZone = require('./drop-zone')

function series(state) {
  var annotations = state.derived.annotations
  var blanks = state.blanks
  var data = state.data
  var editing = state.editing
  var emit = state.emit
  var focused = state.focused
  var merkle = state.derived.merkle
  var offset = state.offset
  var path = state.path
  return data.content
    .map(function(child, index) {
      var absoluteIndex = ( index + offset )
      var pathSuffix = [ 'content', absoluteIndex ]
      var result = require('./form')({
        blanks: blanks,
        form: child,
        derived: {
          annotations: get(annotations, [ 'content', absoluteIndex ], { }),
          merkle: merkle.content[absoluteIndex] },
        editing: editing,
        emit: emit,
        focused: focused,
        path: path.concat(pathSuffix) })
      return [
        result,
        renderDropZone({
          emit: emit,
          path: path.concat('content', ( absoluteIndex + 1 )) }) ] }) }
