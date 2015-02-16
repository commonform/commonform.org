var React = require('react');
var formChange = require('./form-change');
var idOf = require('./id-of');
var sanitize = require('./sanitize-string');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      summary: this.props.summary
    };
  },

  handleBlur: function() {
    var sanitized = sanitize(this.state.summary);
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

  render: function() {
    var summary = this.props.summary;
    var attributes = {
      className: 'summary form-control',
      id: idOf('summary', summary),
      onBlur: this.handleBlur,
      onChange: this.handleChange,
      value: this.state.summary
    };
    return React.DOM.form({className: 'form col-sm-11'},
        React.DOM.input(attributes)
    );
  }
});
