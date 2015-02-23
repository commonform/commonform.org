var ImmutableMixin = require('react-immutable-render-mixin');
var React = require('react');

var DigestLine = require('./digest-line');

module.exports = React.createClass({
  displayName: 'Annotations',

  mixins: [ImmutableMixin],

  render: function() {
    return React.DOM.div({
      className: 'annotations',
    }, [
      React.createElement(DigestLine, {
        key: 'digest',
        digest: this.props.digest
      })
    ]);
  }
});
