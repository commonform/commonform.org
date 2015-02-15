var idOf = require('./id-of');

module.exports = React.createClass({
  render: function() {
    var attributes = {
      className: 'reference',
      'data-summary': '#' + idOf('summary', this.props.summary)
    };
    return React.DOM.span(attributes, '{' + this.props.summary + '}');
  }
});
