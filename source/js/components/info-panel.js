var React = require('react');

var DOM = React.DOM;
var panel = React.createFactory(require('./bootstrap-panel'));

module.exports = React.createClass({
  displayName: 'InfoPanel',

  render: function() {
    return DOM.div({
      key: 'container',
      className: 'container'
    },
      panel({
        key: 'panel',
        heading: 'Info',
        type: 'info'
      }, [
        'This form’s fingerprint is ',
        this.props.digest
      ])
    );
  }
});
