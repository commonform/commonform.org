var React = require('react');

var attributes = {className: 'field'};

module.exports = React.createClass({
  text: function() {
    return this.props.value;
  },
  render: function() {
    return React.DOM.span(attributes, this.text());
  }
});
