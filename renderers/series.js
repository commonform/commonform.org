module.exports = series

function series(state) {
  var data = state.data
  var merkle = state.derived.merkle
  var offset = state.offset
  var path = state.path
  return data.content
    .map(function(child, index) {
      var absoluteIndex = ( index + offset )
      var childPath = path
        .concat([ 'content', absoluteIndex ])
      var result = require('./form')({
        derived: {
          merkle: merkle.content[absoluteIndex] },
        data: child,
        path: childPath })
      return result }) }
