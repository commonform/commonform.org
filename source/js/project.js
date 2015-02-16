var ButtonsBar = require('./buttons-bar');
var Form = require('./form');
var IssuesList = require('./issues-list');
var Navigation = require('./navigation');
var formStore = require('./form-store');
var lint = require('commonform-lint');

module.exports = React.createClass({
  mixins: [Reflux.listenTo(formStore, 'onFormChange', 'onFormChange')],

  onFormChange: function(form) {
    this.setProps({
      form: form
    });
  },

  getDefaultProps: function() {
    return {
      commonform: '0.0.0',
      form: {
        content: ['Initial text']
      },
      metadata: {
        title: 'Untitled Project'
      },
      preferences: {},
      values: {}
    };
  },

  render: function() {
    return React.DOM.div({
      className: 'project'
    }, [
      React.createElement(Navigation),
      React.createElement(ButtonsBar, {
        project: this.props
      }),
      React.createElement(IssuesList, {
        issues: lint(this.props)
      }),
      React.DOM.div({
        className: 'container'
      }, [
        React.createElement(Form, {
          form: this.props.form,
          path: []
        })
      ])
    ]);
  }
});
