var ImmutableMixin = require('react-immutable-render-mixin');
var React = require('react');

var Annotations = require('./annotations');
var Summary = require('./summary');
var FormButton = require('./form-button');
var depthOfPath = require('../helpers/depth-of-path');

var ANNOTATION_WIDTH = require('../helpers/constants').ANNOTATION_WIDTH;

module.exports = React.createClass({
  displayName: 'SubForm',

  mixins: [ImmutableMixin],

  render: function() {
    var props = this.props;
    var path = props.path;
    var subForm = props.subForm;
    var depth = depthOfPath(path);
    var issuesTree = props.issuesTree;
    var width = 12 - ANNOTATION_WIDTH - depth;
    var digestTree = props.digestTree.get('form');
    return React.DOM.div({
      className: 'subForm'
    }, [
      React.DOM.div({
        key: 'first',
        className: 'row'
      }, [
        React.createElement(FormButton, {
          key: 'button',
          subForm: subForm,
          followed: props.followed,
          preceded: props.preceded,
          depth: depth,
          only: props.only,
          path: props.path
        }),
        React.createElement(Summary, {
          key: 'summary',
          summary: subForm.get('summary'),
          path: props.path.push('summary'),
          width: width - 1
        }),
        React.DOM.div({
          key: 'marginalia',
          className: 'marginalia col-sm-' + ANNOTATION_WIDTH
        }, [
          React.createElement(Annotations, {
            key: 'annotations',
            digest: digestTree.get('digest')
          })
        ])
      ]),
      React.DOM.div({
        key: 'second',
        className: 'row'
      }, [
        React.createElement(require('./form'), {
          key: 'form',
          form: subForm.get('form'),
          path: path.push('form'),
          issuesTree: issuesTree,
          digestTree: digestTree
        })
      ])
    ]);
  }
});
