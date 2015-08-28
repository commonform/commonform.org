var childButton = require('./child-button')
var childMenu = require('./child-menu')
var deepEqual = require('deep-equal')
var form = require('./form')
var heading = require('./heading')

function child(state) {
  return require('virtual-dom/h')(
    ( deepEqual(state.focused, state.path) ?
      'div.child.focused' : 'div.child' ),
    [ childButton(state),
      ( deepEqual(state.focused, state.path) ?
        childMenu(state) : undefined ),
      heading({
        digest: state.digest,
        focused: state.focused,
        path: state.path.concat('heading'),
        emit: state.emit,
        data: state.data.heading}),
      require('./form')({
        digest: state.digest,
        merkle: state.merkle,
        focused: state.focused,
        path: state.path.concat('form'),
        annotations: state.annotations,
        emit: state.emit,
        data: state.data.form }) ]) }

module.exports = child
