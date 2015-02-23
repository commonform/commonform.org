var React = require('react');

var DOM = React.DOM;

module.exports = React.createClass({
  displayName: 'DigestLine',

  render: function() {
    return DOM.p({className: 'digest'},
      this.props.digest.slice(0, 16),
      React.createElement('wbr', {key: 'split1'}),
      this.props.digest.slice(16, 32),
      React.createElement('wbr', {key: 'split2'}),
      this.props.digest.slice(32, 48),
      React.createElement('wbr', {key: 'split3'}),
      this.props.digest.slice(48)
    );
  }
});
