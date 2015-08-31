var childButton = require('./child-button')
var childMenu = require('./child-menu')
var deepEqual = require('deep-equal')
var form = require('./form')
var get = require('keyarray-get')
var heading = require('./heading')

function child(state) {
  var isFocused = deepEqual(state.focused, state.path)
  return require('virtual-dom/h')(
    ( isFocused ? 'div.child.focused' : 'div.child' ),
    [ childButton(state),
      ( isFocused ? childMenu(state) : undefined ),
      heading({
        digest: state.digest,
        isFocused: isFocused,
        path: state.path.concat('heading'),
        emit: state.emit,
        data: state.data.heading}),
      require('./form')({
        digest: state.digest,
        merkle: state.merkle,
        focused: state.focused,
        path: state.path.concat('form'),
        annotationsTree: (
          get(state.annotationsTree, [ 'form' ]) || { } ),
        emit: state.emit,
        data: state.data.form }) ]) }

module.exports = child
