var ImmutableMixin = require('react-immutable-render-mixin');
var React = require('react');

module.exports = React.createClass({
  displayName: 'Field',

  mixins: [ImmutableMixin],

  text: function() {
    return '[' + this.props.value + ']';
  },

  render: function() {
    return React.DOM.span({className: 'field'}, this.text());
  }
});
