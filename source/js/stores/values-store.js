var Immutable = require('immutable');
var Reflux = require('reflux');

var valueChange = require('../actions/value-change');
var valueDelete = require('../actions/value-delete');

module.exports = Reflux.createStore({
  init: function() {
    this.values = this.getInitialState();
    this.listenTo(valueChange, this.handleChange);
    this.listenTo(valueDelete, this.handleDelete);
  },

  getInitialState: function() {
    return Immutable.Map();
  },

  handleDelete: function(field) {
    this.values = this.values.delete(field);
    this.trigger(this.values);
  },

  handleChange: function(change) {
    this.values = this.values.withMutations(function(values) {
      Object.keys(change).forEach(function(key) {
        var value = change[key];
        values.set(key, value);
      });
    });
    this.trigger(this.values);
  }
});
