var idOf = require('./id-of');

module.exports = React.createClass({
  render: function() {
    var attributes = {
      className: 'use',
      'data-term': '#' + idOf('definition', this.props.term)
    };
    return React.DOM.span(attributes, '<' + this.props.term + '>');
  }
});
