var React = require('react');
var Reflux = require('reflux');
var lint = require('commonform-lint');

var ButtonsBar = require('./buttons-bar');
var Form = require('./form');
var IssuesList = require('./issues-list');
var Navigation = require('./navigation');
var ProjectTitle = require('./project-title');

var formStore = require('../stores/form-store');
var metaStore = require('../stores/metadata-store');

module.exports = React.createClass({
  displayName: 'Project',

  mixins: [
    Reflux.listenTo(formStore, 'handleFormChange', 'handleFormChange'),
    Reflux.listenTo(metaStore, 'handleMetaChange', 'handleMetaChange')
  ],

  handleFormChange: function(form) {
    this.setProps({form: form});
  },

  handleMetaChange: function(metadata) {
    this.setProps({metadata: metadata});
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
      React.createElement(ProjectTitle, {
        key: 'title',
        title: this.props.metadata.title
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
