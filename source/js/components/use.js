var ImmutableMixin = require('react-immutable-render-mixin');
var React = require('react');

var idOf = require('../helpers/id-of');

module.exports = React.createClass({
  displayName: 'Use',

  mixins: [ImmutableMixin],

  text: function() {
    return '<' + this.props.term + '>';
  },

  render: function() {
    var attributes = {
      className: 'use',
      'data-term': '#' + idOf('definition', this.props.term)
    };
    return React.DOM.span(attributes, this.text());
  }
});
