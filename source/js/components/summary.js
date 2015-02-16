var React = require('react');

var formChange = require('../actions/form-change');
var idOf = require('../helpers/id-of');
var sanitize = require('../helpers/sanitize-string');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      summary: this.props.summary
    };
  },

  handleBlur: function() {
    var sanitized = sanitize(this.state.summary);
    if (sanitized.length > 0) {
      formChange({
        type: 'set',
        path: this.props.path,
        value: sanitized
      });
    } else {
      formChange({
        type: 'del',
        path: this.props.path
      });
    }
  },

  handleChange: function(event) {
    this.setState({summary: event.target.value});
  },

  render: function() {
    var summary = this.props.summary;
    var attributes = {
      key: 'summary',
      className: 'summary form-control',
      id: idOf('summary', summary),
      onBlur: this.handleBlur,
      onChange: this.handleChange,
      value: this.state.summary
    };
    return React.DOM.form({
      key: 'form',
      className: 'form col-sm-11'
    }, [React.DOM.input(attributes)]);
  }
});
