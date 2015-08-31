var get = require('keyarray-get')
var h = require('virtual-dom/h')
var renderChild = require('./child')

function series(state) {
  return state.data.content
    .map(function(child, index) {
      var absoluteIndex = ( index + state.offset )
      var childPath = state.path
        .concat([ 'content', absoluteIndex ])
      var annotationsTree = (
        get(state.annotationsTree, [ 'content', absoluteIndex ]) ||
        { } )
      var result = renderChild({
        annotationsTree: annotationsTree,
        data: child,
        digest: state.digest,
        merkle: state.merkle.content[absoluteIndex],
        emit: state.emit,
        path: childPath })
      return result }) }

module.exports = series
