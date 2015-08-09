function child(state) {
  return require('virtual-dom/h')(
    'div.child',
    [ require('./heading')(state.heading),
      require('./form')(state.form) ]) }

module.exports = child
