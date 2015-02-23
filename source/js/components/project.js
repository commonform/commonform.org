var Immutable = require('immutable');
var React = require('react');
var lint = require('commonform-lint');
var merkleize = require('commonform-merkleize');

var ButtonsBar = require('./buttons-bar');
var Form = require('./form');
var Navigation = require('./navigation');
var ProjectTitle = require('./project-title');
var Values = require('./values');
var projectStore = require('../stores/project-store');
var treeifyIssuesList = require('../helpers/treeify-issues-list');

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

  computeIssuesTree: function(newProject) {
    var issues = lint(
      newProject.get('form'),
      newProject.get('values'),
      Immutable.Map()
    );
    return treeifyIssuesList(issues);
  },

  componentWillMount: function() {
    var component = this;
    var newProjectHandler = function(newProject) {
      component.setState({
        project: newProject,
        digestTree: component.computeDigestTree(newProject),
        issuesTree: component.computeIssuesTree(newProject)
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
    var state = this.state;
    var project = state.project;
    var form = project.get('form');
    var values = project.get('values');
    var digestTree = state.digestTree;
    var issuesTree = state.issuesTree;
    return React.DOM.div({
      key: 'project',
      className: 'project'
    }, [
      React.createElement(Navigation, {
        key: 'navigation'
      }),
      React.createElement(ButtonsBar, {
        key: 'buttons',
        project: project
      }),
      React.createElement(ProjectTitle, {
        key: 'title',
        title: project.get('metadata').get('title')
      }),
      React.createElement(Values, {
        key: 'values',
        values: values
      }),
      React.DOM.div({
        key: 'container',
        className: 'container'
      }, [
        React.createElement(Form, {
          key: 'form',
          form: form,
          path: Immutable.List(),
          issuesTree: issuesTree,
          digestTree: digestTree
        })
      ])
    ]);
  }
});
