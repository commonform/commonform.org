var ImmutableMixin = require('react-immutable-render-mixin');
var React = require('react');

module.exports = React.createClass({
  displayName: 'Annotations',

  mixins: [ImmutableMixin],

  render: function() {
    return React.DOM.span({}, [
      React.DOM.p({
        className: 'digest',
        key: 'digest'
      }, this.props.digest)
    ]);
  }
});
