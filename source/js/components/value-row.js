var ImmutableMixin = require('react-immutable-render-mixin');
var React = require('react');

var valueChange = require('../actions/value-change');
var valueDelete = require('../actions/value-delete');

var DOM = React.DOM;

module.exports = React.createClass({
  displayName: 'ValueRow',

  mixins: [ImmutableMixin],

  onChange: function(event) {
    var object = {};
    object[this.props.field] = event.target.value;
    valueChange(object);
  },

  onClick: function() {
    valueDelete(this.props.field);
  },

  render: function() {
    var field = this.props.field;
    var value = this.props.value;
    return DOM.tr({key: 'field-' + field}, [
      DOM.td({key: 'first'}, [
        DOM.label({
          key: 'name'
        }, this.props.field)
      ]),
      DOM.td({key: 'second'}, [
        DOM.input({
          key: 'name',
          className: 'form-control',
          name: 'value',
          placeholder: 'Field value',
          value: value,
          onChange: this.onChange
        })
      ]),
      DOM.td({key: 'submit'}, [
        DOM.button({
          key: 'submit',
          type: 'submit',
          className: 'btn btn-default' +
            (field.length > 0 && value.length > 0 ? '' : ' disabled'),
          onClick: this.onClick
        }, 'Delete')
      ])
    ]);
  }
});
