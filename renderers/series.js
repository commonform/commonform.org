var get = require('keyarray').get

function series(state) {
  var annotations = state.derived.annotations
  var data = state.data
  var emit = state.emit
  var focused = state.focused
  var merkle = state.derived.merkle
  var offset = state.offset
  var path = state.path
  return data.content
    .map(function(child, index) {
      var absoluteIndex = ( index + offset )
      var childPath = path
        .concat([ 'content', absoluteIndex ])
      var childAnnotations = (
        get(annotations, [ 'content', absoluteIndex ]) ||
        { } )
      var result = require('./form')({
        derived: {
          annotations: childAnnotations,
          merkle: merkle.content[absoluteIndex] },
        data: child,
        focused: focused,
        emit: emit,
        path: childPath })
      return result }) }

module.exports = series
