var React = require('react/addons');

var titleStore = require('../stores/title-store');

module.exports = React.createClass({
  displayName: 'Project',

  mixins: [React.addons.PureRenderMixin],

  componentWillMount: function() {
    var onUpdate = function(title) {
      this.setState({title: title});
    }.bind(this);
    this.stopListeningToStore = titleStore.listen(onUpdate);
    onUpdate(titleStore.getInitialState());
  },

  componentWillUnmount: function() {
    this.stopListeningToStore();
  },

  render: function() {
    return React.DOM.h1({
      className: 'title'
    }, [
      this.state.title
    ]);
  }
});
