var React = require('react');

var DOM = React.DOM;
var panel = React.createFactory(require('./bootstrap-panel'));

module.exports = React.createClass({
  render: function() {
    var issues = this.props.issues;
    if (issues.length === 0) {
      return DOM.div({
        key: 'container',
        className: 'container'
      }, [
        panel({
          key: 'panel',
          type: 'success',
          heading: 'Execution-Ready'
        }, [
          DOM.p({key: 'p'},
            'This project is ready to sign. ' +
            'There are no technical errors or blanks to be filled.'
          )
        ])
      ]);
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
              key: JSON.stringify(issue)
            }, issue.message);
          })
        ])
      );
    }
  }
});
