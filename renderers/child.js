var childButton = require('./child-button')
var childMenu = require('./child-menu')
var deepEqual = require('deep-equal')
var form = require('./form')
var get = require('keyarray-get')
var heading = require('./heading')

function child(state) {
  return require('virtual-dom/h')(
    'section',
    [ childMenu(state),
      heading({
        digest: state.digest,
        path: state.path.concat('heading'),
        emit: state.emit,
        data: state.data.heading}),
      require('./form')({
        digest: state.digest,
        merkle: state.merkle,
        path: state.path.concat('form'),
        annotationsTree: (
          get(state.annotationsTree, [ 'form' ]) || { } ),
        emit: state.emit,
        data: state.data.form }) ]) }

module.exports = child
