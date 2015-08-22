var heading = require('./heading')
var form = require('./form')
var childButton = require('./child-button')

function child(state) {
  return require('virtual-dom/h')(
    'div.child',
    [ childButton(state),
      heading({
        digest: state.digest,
        path: state.path.concat('heading'),
        annotations: state.annotations,
        emit: state.emit,
        data: state.data.heading}),
      require('./form')({
        digest: state.digest,
        path: state.path.concat('form'),
        annotations: state.annotations,
        emit: state.emit,
        data: state.data.form }) ]) }

module.exports = child
