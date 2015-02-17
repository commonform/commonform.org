var Reflux = require('reflux');
var objectAssign = require('object-assign');

var valueChange = require('../actions/value-change');
var valueDelete = require('../actions/value-delete');

module.exports = Reflux.createStore({
  init: function() {
    this.listenTo(valueChange, this.handleChange);
    this.listenTo(valueDelete, this.handleDelete);
    this.values = this.getInitialState();
  },

  getInitialState: function() {
    return {};
  },

  handleDelete: function(field) {
    delete this.values[field];
    this.trigger(this.values);
  },

  handleChange: function(change) {
    objectAssign(this.values, change);
    this.trigger(this.values);
  }
});
