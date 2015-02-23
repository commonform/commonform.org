var ImmutableMixin = require('react-immutable-render-mixin');
var React = require('react');

var Annotations = require('./annotations');
var Summary = require('./summary');
var FormButton = require('./form-button');
var depthOfPath = require('../helpers/depth-of-path');

module.exports = React.createClass({
  displayName: 'SubForm',

  mixins: [ImmutableMixin],

  render: function() {
    var props = this.props;
    var path = props.path;
    var subForm = props.subForm;
    var depth = depthOfPath(path);
    var width = 12 - 5 - depth;
    var digestTree = props.digestTree.get('form');
    return React.DOM.div({
      className: 'subForm'
    }, [
      React.DOM.div({
        key: 'first',
        className: 'row'
      }, [
        React.DOM.div({
          key: 'buttonAndSummary',
          className: 'col-sm-offset-' + depth + ' col-sm-' + width
        }, [
          React.createElement(FormButton, {
            key: 'button',
            subForm: subForm,
            followed: props.followed,
            preceded: props.preceded,
            only: props.only,
            path: props.path
          }),
          React.createElement(Summary, {
            key: 'summary',
            summary: subForm.get('summary'),
            path: props.path.push('summary')
          })
        ]),
        React.DOM.div({
          key: 'marginalia',
          className: 'marginalia col-sm-5'
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
          digestTree: digestTree
        })
      ])
    ]);
  }
});
