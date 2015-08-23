var h = require('virtual-dom/h')
var renderChild = require('./child')

function series(state) {
  return state.data.content
    .map(function(child, index) {
      var childPath = state.path
        .concat([ 'content', index + state.offset ])
      var result = renderChild({
        annotations: state.annotations,
        data: child,
        digest: state.digest,
        emit: state.emit,
        focused: state.focused,
        path: childPath })
      return result }) }

module.exports = series
