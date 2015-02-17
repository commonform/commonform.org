var ImmutableMixin = require('react-immutable-render-mixin');
var React = require('react');

var idOf = require('../helpers/id-of');

module.exports = React.createClass({
  mixins: [ImmutableMixin],

  text: function() {
    return '{' + this.props.summary + '}';
  },

  render: function() {
    var attributes = {
      className: 'reference',
      'data-summary': '#' + idOf('summary', this.props.summary)
    };
    return React.DOM.span(attributes, this.text());
  }
});
