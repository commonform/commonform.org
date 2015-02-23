var Immutable = require('immutable');
var React = require('react');

var SubForm = require('./sub-form');

module.exports = React.createClass({
  displayName: 'Series',

  render: function() {
    var props = this.props;
    var path = props.path;
    var issuesTree = props.issuesTree;
    var offset = props.offset;
    var followed = props.followed;
    var content = props.content;
    var children = content.toArray().map(function(subForm, index, a) {
      var parentIndex = offset + index;
      var subFormPath = path.push(parentIndex);
      var digestTree = props.digestTree.getIn(['content', parentIndex]);
      var digest = digestTree.getIn(['form', 'digest']);
      var newIssuesTree = issuesTree.getIn(
        [parentIndex, 'form'], Immutable.Map()
      );
      var childAttributes = {
        key: '' + index + ':' + subForm.get('summary') + ':' + digest,
        only: props.only,
        path: subFormPath,
        digestTree: digestTree,
        issuesTree: newIssuesTree,
        subForm: subForm
      };
      childAttributes.followed = (index === a.length - 1) && followed;
      childAttributes.preceded = (index === 0) && props.preceded;
      var childPath = subFormPath.push('content', index);
      return React.createElement(SubForm, childAttributes, childPath);
    });
    return React.DOM.div({
      key: 'div',
      className: 'series'
    }, children);
  }
});
