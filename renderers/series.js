module.exports = series

var get = require('keyarray').get

function series(state) {
  var annotations = state.derived.annotations
  var blanks = state.blanks
  var data = state.data
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
        emit: emit,
        focused: focused,
        path: path.concat(pathSuffix) })
      return result }) }
