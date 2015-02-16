var React = require('react');
var idOf = require('./id-of');

module.exports = React.createClass({
  text: function() {
    return '<' + this.props.term + '>';
  },
  render: function() {
    var attributes = {
      className: 'use',
      'data-term': '#' + idOf('definition', this.props.term)
    };
    return React.DOM.span(attributes, this.text());
  }
});
