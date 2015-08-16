function child(state) {
  return require('virtual-dom/h')(
    'div.child',
    [ require('./heading')({
        path: state.path.concat('heading'),
        update: state.update,
        data: state.data.heading}),
      require('./form')({
        path: state.path.concat('form'),
        update: state.update,
        data: state.data.form }) ]) }

module.exports = child
