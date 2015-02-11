var idOf = require('./id-of');

module.exports = React.createClass({
  render: function() {
    var attributes = {
      id: idOf('definition', this.props.term),
      className: 'definition'
    };
    return React.DOM.dfn(attributes, this.props.term);
  }
});
