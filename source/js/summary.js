var idOf = require('./id-of');

module.exports = React.createClass({
  render: function() {
    var summary = this.props.summary;
    var attributes = {
      id: idOf('summary', summary),
      className: 'summary'
    };
    return React.DOM.span(attributes, summary);
  }
});
