var React = require('react');
var idOf = require('./id-of');

module.exports = React.createClass({
  text: function() {
    return '""' + this.props.term + '""';
  },
  render: function() {
    var attributes = {
      id: idOf('definition', this.props.term),
      className: 'definition'
    };
    return React.DOM.dfn(attributes, this.text());
  }
});
