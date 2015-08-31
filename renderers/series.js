var get = require('keyarray-get')

function series(state) {
  return state.data.content
    .map(function(child, index) {
      var absoluteIndex = ( index + state.offset )
      var childPath = state.path
        .concat([ 'content', absoluteIndex ])
      var annotationsTree = (
        get(state.annotationsTree, [ 'content', absoluteIndex ]) ||
        { } )
      var result = require('./form')({
        annotationsTree: annotationsTree,
        data: child,
        digest: state.digest,
        merkle: state.merkle.content[absoluteIndex],
        emit: state.emit,
        path: childPath })
      return result }) }

module.exports = series
