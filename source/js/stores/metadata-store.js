var Immutable = require('immutable');
var Reflux = require('reflux');

var titleChange = require('../actions/title-change');

module.exports = Reflux.createStore({
  init: function() {
    this.metadata = this.getInitialState();
    this.listenTo(titleChange, this.handleTitleChange);
  },

  getInitialState: function() {
    return Immutable.Map({
      title: 'Untitled Project'
    });
  },

  handleTitleChange: function(newTitle) {
    this.metadata = this.metadata.set('title', newTitle);
    this.trigger(this.metadata);
  }
});
