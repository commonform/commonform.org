var idOf = require('./id-of');

module.exports = React.createClass({
  render: function() {
    var attributes = {
      className: 'use',
      href: '#' + idOf('definition', this.props.term)
    };
    return React.DOM.a(attributes, this.props.term);
  }
});
