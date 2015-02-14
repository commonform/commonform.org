var idOf = require('./id-of');
var formChange = require('./form-change');

module.exports = React.createClass({
  onChange: function(event) {
    formChange({
      type: 'set',
      path: this.props.path,
      value: event.target.value
    });
  },
  render: function() {
    var summary = this.props.summary;
    var attributes = {
      id: idOf('summary', summary),
      className: 'summary',
      onChange: this.onChange,
      value: summary
    };
    return React.DOM.input(attributes);
  }
});
