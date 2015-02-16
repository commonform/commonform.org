var React = require('react');
var Reflux = require('reflux');
var lint = require('commonform-lint');

var ButtonsBar = require('./buttons-bar');
var Form = require('./form');
var IssuesList = require('./issues-list');
var Navigation = require('./navigation');
var formStore = require('../stores/form-store');

module.exports = React.createClass({
  displayName: 'Project',

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
      key: 'project',
      className: 'project'
    }, [
      React.createElement(Navigation, {
        key: 'navigation'
      }),
      React.createElement(ButtonsBar, {
        key: 'buttons',
        project: this.props
      }),
      React.createElement(IssuesList, {
        key: 'issues',
        issues: lint(this.props)
      }),
      React.DOM.div({
        key: 'container',
        className: 'container'
      }, [
        React.createElement(Form, {
          key: 'form',
          form: this.props.form,
          path: []
        })
      ])
    ]);
  }
});
