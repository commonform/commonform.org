var React = require('react');

var DOM = React.DOM;

module.exports = React.createClass({
  displayName: 'DigestLine',

  render: function() {
    return DOM.div({className: 'row'},
      DOM.div({className: 'col-sm-12 digest'},
        'Fingerprint: ' + this.props.digest
      )
    );
  }
});
