var h = require('virtual-dom/h')
var renderChild = require('./child')

function series(state) {
  return state.data.content
    .map(function(child, index) {
      var absoluteIndex = ( index + state.offset )
      var childPath = state.path
        .concat([ 'content', absoluteIndex ])
      var result = renderChild({
        annotations: state.annotations,
        data: child,
        digest: state.digest,
        merkle: state.merkle.content[absoluteIndex],
        emit: state.emit,
        focused: state.focused,
        path: childPath })
      return result }) }

module.exports = series
