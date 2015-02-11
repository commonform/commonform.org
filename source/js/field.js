var React = require('react');

var attributes = {className: 'field'};

module.exports = React.createClass({
  render: function() {
    return React.DOM.span(attributes, this.props.value);
  }
});
