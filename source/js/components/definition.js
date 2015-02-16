var React = require('react');

var idOf = require('../helpers/id-of');

module.exports = React.createClass({
  text: function() {
    return '""' + this.props.term + '""';
  },

  render: function() {
    return React.DOM.dfn({
      id: idOf('definition', this.props.term),
      className: 'definition'
    }, this.text());
  }
});
