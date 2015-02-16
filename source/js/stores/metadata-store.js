var Reflux = require('reflux');

var titleChange = require('../actions/title-change');

module.exports = Reflux.createStore({
  init: function() {
    this.listenTo(titleChange, this.handleTitleChange);
    this.metadata = this.getInitialState();
  },

  getInitialState: function() {
    return {
      title: 'Untitled Project'
    };
  },

  handleTitleChange: function(newTitle) {
    this.metadata.title = newTitle;
    this.trigger(this.metadata);
  }
});
