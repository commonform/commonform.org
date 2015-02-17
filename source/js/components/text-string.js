var React = require('react');

module.exports = React.createClass({
  displayName: 'TextString',

  render: function() {
    return React.DOM.span({}, this.props.string);
  }
});
