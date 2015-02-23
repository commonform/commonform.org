var ImmutableMixin = require('react-immutable-render-mixin');
var React = require('react');
var group = require('commonform-group-series');

var DigestLine = require('./digest-line');
var Paragraph = require('./paragraph');
var Series = require('./series');

var notLastInArray = function(index, array) {
  return index < (array.count() - 1);
};

module.exports = React.createClass({
  displayName: 'Form',

  mixins: [ImmutableMixin],

  render: function() {
    var props = this.props;
    var digestTree = props.digestTree;
    var path = props.path;
    var form = props.form;
    var pathCounter = 0;
    var groups = group(form);
    var groupsLength = groups.count();
    var haveSeenParagraph = false;
    var children = groups.map(function(group, index, groups) {
      var content = group.get('content');
      var type = group.get('type');

      var childAttributes = {
        key: group.type + '-' + index,
        content: content,
        path: path.push('content'),
        offset: pathCounter
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

      childAttributes.only = (groupsLength === 1);

      pathCounter = pathCounter + content.count();
      return type === 'paragraph' ?
        React.createElement(Paragraph, childAttributes) :
        React.createElement(Series, childAttributes);
    });
    return React.DOM.div({
      key: 'div',
      className: 'form',
      path: path
    },
      children.unshift(
        React.createElement(DigestLine, {
          key: 'digest',
          digest: digestTree.get('digest')
        })
      ).toArray());
  }
});
