var React = require('react');

var DOM = React.DOM;
var panel = React.createFactory(require('./bootstrap-panel'));

module.exports = React.createClass({
  displayName: 'IssuesList',

  render: function() {
    var issues = this.props.issues;
    if (issues.count() === 0) {
      return null;
    } else {
      return DOM.div({
        key: 'container',
        className: 'container'
      },
        panel({
          key: 'panel',
          heading: 'Issues',
          type: 'danger'
        }, [
          issues.map(function(issue) {
            return DOM.p({
              key: issue
            }, issue.get('message'));
          }).toJS()
        ])
      );
    }
  }
});
