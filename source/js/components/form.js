var Immutable = require('immutable');
var ImmutableMixin = require('react-immutable-render-mixin');
var React = require('react');
var group = require('commonform-group-series');

var Paragraph = require('./paragraph');
var Series = require('./series');

var emptyMap = Immutable.Map();

var notLastInArray = function(index, array) {
  return index < (array.count() - 1);
};

module.exports = React.createClass({
  displayName: 'Form',

  mixins: [ImmutableMixin],

  render: function() {
    var props = this.props;
    var digestTree = props.digestTree;
    var issuesTree = props.issuesTree;
    var path = props.path;
    var form = props.form;
    var pathCounter = 0;
    var groups = group(form);
    var haveSeenParagraph = false;
    var children = groups.map(function(group, index, groups) {
      var content = group.get('content');
      var childCount = content.count();
      var lastChildParentIndex = pathCounter + childCount;
      var type = group.get('type');
      var newIssuesTree = issuesTree.has('content') ?
        issuesTree.get('content').filter(function(value, key) {
          return key >= pathCounter && key < lastChildParentIndex;
        }) :
        emptyMap;
      var childAttributes = {
        key: group.type + '-' + index,
        content: content,
        path: path.push('content'),
        offset: pathCounter,
        issuesTree: newIssuesTree
      };
      if (type === 'series') {
        childAttributes.followed = notLastInArray(index, groups) &&
          groups.slice(index).some(function(laterGroup) {
            return laterGroup.get('type') === 'paragraph';
          });
        childAttributes.digestTree = digestTree;
        childAttributes.preceded = haveSeenParagraph;
      } else {
        haveSeenParagraph = true;
      }
      childAttributes.only = (groups.count() === 1);
      pathCounter = pathCounter + content.count();
      return type === 'paragraph' ?
        React.createElement(Paragraph, childAttributes) :
        React.createElement(Series, childAttributes);
    });
    return React.DOM.div({
      key: 'div',
      className: 'form col-sm-12',
      path: path
    }, children.toArray());
  }
});
