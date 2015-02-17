var React = require('react');
var Reflux = require('reflux');
var lint = require('commonform-lint');

var ButtonsBar = require('./buttons-bar');
var Form = require('./form');
var IssuesList = require('./issues-list');
var Navigation = require('./navigation');
var ProjectTitle = require('./project-title');
var Values = require('./values');

var formStore = require('../stores/form-store');
var metaStore = require('../stores/metadata-store');
var valuesStore = require('../stores/values-store');

module.exports = React.createClass({
  displayName: 'Project',

  mixins: [
    Reflux.listenTo(formStore, 'onFormChange', 'onFormChange'),
    Reflux.listenTo(metaStore, 'onMetaChange', 'onMetaChange'),
    Reflux.listenTo(valuesStore, 'onValueChange', 'onValueChange')
  ],

  onFormChange: function(form) {
    this.setProps({form: form});
  },

  onMetaChange: function(metadata) {
    this.setProps({metadata: metadata});
  },

  onValueChange: function(values) {
    this.setProps({values: values});
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
    var props = this.props;
    var issues = lint(props);
    return React.DOM.div({
      key: 'project',
      className: 'project'
    }, [
      React.createElement(Navigation, {
        key: 'navigation'
      }),
      React.createElement(ButtonsBar, {
        key: 'buttons',
        project: props
      }),
      React.createElement(ProjectTitle, {
        key: 'title',
        title: props.metadata.title
      }),
      React.createElement(IssuesList, {
        key: 'issues',
        issues: issues
      }),
      React.createElement(Values, {
        key: 'values',
        values: props.values
      }),
      React.DOM.div({
        key: 'container',
        className: 'container'
      }, [
        React.createElement(Form, {
          key: 'form',
          form: props.form,
          path: []
        })
      ])
    ]);
  }
});
