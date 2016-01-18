module.exports = series

function series(state) {
  var blanks = state.blanks
  var data = state.data
  var emit = state.emit
  var merkle = state.derived.merkle
  var offset = state.offset
  var path = state.path
  return data.content
    .map(function(child, index) {
      var absoluteIndex = ( index + offset )
      var childPath = path
        .concat([ 'content', absoluteIndex ])
      var result = require('./form')({
        blanks: blanks,
        form: child,
        derived: { merkle: merkle.content[absoluteIndex] },
        emit: emit,
        path: childPath })
      return result }) }
