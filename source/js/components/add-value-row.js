var React = require('react');
var valueChange = require('../actions/value-change');

var DOM = React.DOM;

module.exports = React.createClass({
  displayName: 'AddValueRow',

  getInitialState: function() {
    return {
      field: '',
      value: ''
    };
  },

  onSubmit: function(event) {
    event.preventDefault();
    var state = this.state;
    var object = {};
    object[state.field] = state.value;
    valueChange(object);
    this.setState({field: '', value: ''});
  },

  onFieldChange: function(event) {
    this.setState({field: event.target.value});
  },

  onValueChange: function(event) {
    this.setState({value: event.target.value});
  },

  render: function() {
    var state = this.state;
    var field = state.field;
    var value = state.value;
    return DOM.tr({key: 'add'}, [
      DOM.td({key: 'first'}, [
        DOM.input({
          key: 'name',
          className: 'form-control',
          name: 'field',
          placeholder: 'Field name',
          value: field,
          onChange: this.onFieldChange
        })
      ]),
      DOM.td({key: 'second'}, [
        DOM.input({
          key: 'name',
          className: 'form-control',
          name: 'value',
          placeholder: 'Field value',
          value: value,
          onChange: this.onValueChange
        })
      ]),
      DOM.td({key: 'submit'}, [
        DOM.button({
          key: 'submit',
          type: 'submit',
          className: 'btn btn-default' +
            (field.length > 0 && value.length > 0 ? '' : ' disabled'),
          onClick: this.onSubmit
        }, 'Add')
      ])
    ]);
  }
});
