var idOf = require('./id-of');

module.exports = React.createClass({
  render: function() {
    var attributes = {
      className: 'reference',
      href: '#' + idOf('summary', this.props.summary)
    };
    return React.DOM.a(attributes, this.props.summary);
  }
});
