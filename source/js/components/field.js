var React = require('react');

module.exports = React.createClass({
  text: function() {
    return this.props.value;
  },

  render: function() {
    return React.DOM.span({className: 'field'}, this.text());
  }
});
