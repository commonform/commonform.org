var idOf = require('./id-of');
var debounce = require('just-debounce');
var formChange = require('./form-change');
var sanitize = require('./sanitize-string');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      summary: this.props.summary
    };
  },
  componentWillMount: function() {
    this.debouncedOnChange = debounce(function() {
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
    }, 500);
  },
  onChange: function(event) {
    this.setState({summary: event.target.value});
    this.debouncedOnChange();
  },
  render: function() {
    var summary = this.props.summary;
    var attributes = {
      id: idOf('summary', summary),
      className: 'summary form-control',
      onChange: this.onChange,
      ref: 'inputBox',
      value: this.state.summary
    };
    return React.DOM.form({className: 'form-inline'},
        React.DOM.input(attributes)
    );
  }
});
