var React = require('react');

module.exports = React.createClass({
  render: function() {
    return React.DOM.span({}, this.props.string);
  }
});
