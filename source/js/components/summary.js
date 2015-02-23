var React = require('react');

var formChange = require('../actions/form-change');
var idOf = require('../helpers/id-of');
var sanitize = require('../helpers/sanitize-string');

module.exports = React.createClass({
  displayName: 'Summary',

  getInitialState: function() {
    return {
      summary: this.props.summary
    };
  },

  handleBlur: function() {
    var sanitized = sanitize(this.state.summary || '');
    this.setState({summary: sanitized});
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

  handleSubmit: function(event) {
    event.preventDefault();
    this.handleBlur();
  },

  render: function() {
    var summary = this.props.summary;
    var attributes = {
      className: 'summary form-control',
      id: idOf('summary', summary),
      key: 'summary',
      onBlur: this.handleBlur,
      onChange: this.handleChange,
      onKeyDown: this.handleKeyDown,
      value: this.state.summary || ''
    };
    return React.DOM.form({
      className: 'form col-sm-' + this.props.width,
      key: 'form',
      onSubmit: this.handleSubmit
    }, [React.DOM.input(attributes)]);
  }
});
