var Reflux = require('reflux');

module.exports = Reflux.createStore({
  init: function() {
    this.value = this.getInitialState();
  },

  getInitialState: function() {
    return 'Untitled Agreement';
  }
});
