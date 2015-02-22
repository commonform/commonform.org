var Immutable = require('immutable');
var React = require('react');
var lint = require('commonform-lint');
var merkleize = require('commonform-merkleize');

var ButtonsBar = require('./buttons-bar');
var Form = require('./form');
var IssuesList = require('./issues-list');
var Navigation = require('./navigation');
var ProjectTitle = require('./project-title');
var Values = require('./values');
var projectStore = require('../stores/project-store');

var createElement = React.createElement.bind(React);
var noPreferences = Immutable.Map();
var rootPath = Immutable.List();

module.exports = React.createClass({
  displayName: 'Project',

  computeDigestTree: function(newProject) {
    var state = this.state;
    return merkleize(
      newProject.get('form'),
      state && state.hasOwnProperty('project') ?
        state.project.get('form', false) : false,
      state && state.hasOwnProperty('digestTree') ?
        state.digestTree : false
    );
  },

  componentWillMount: function() {
    var component = this;
    var newProjectHandler = function(newProject) {
      component.setState({
        project: newProject,
        digestTree: component.computeDigestTree(newProject)
      });
    };
    this.stopListening = projectStore.listen(newProjectHandler);
    var initialProject = projectStore.getInitialState();
    newProjectHandler(initialProject);
  },

  componentWillUnmount: function() {
    this.stopListening();
  },

  render: function() {
    var project = this.state.project;
    var form = project.get('form');
    var values = project.get('values');
    var issues = lint(form, values, noPreferences);
    var digestTree = this.state.digestTree;
    return React.DOM.div({
      key: 'project',
      className: 'project'
    }, [
      createElement(Navigation, {
        key: 'navigation'
      }),
      createElement(ButtonsBar, {
        key: 'buttons',
        project: project
      }),
      createElement(ProjectTitle, {
        key: 'title',
        title: project.get('metadata').get('title')
      }),
      createElement(IssuesList, {
        key: 'issues',
        issues: issues
      }),
      createElement(Values, {
        key: 'values',
        values: values
      }),
      React.DOM.div({
        key: 'container',
        className: 'container'
      }, [
        createElement(Form, {
          key: 'form',
          form: form,
          path: rootPath,
          digestTree: digestTree
        })
      ])
    ]);
  }
});
