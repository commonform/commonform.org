var Immutable = require('immutable');
var ImmutableMixin = require('react-immutable-render-mixin');
var React = require('react');
var group = require('commonform-group-series');

var Paragraph = require('./paragraph');
var Series = require('./series');

var notLastInArray = function(index, array) {
  return index < (array.length - 1);
};

module.exports = React.createClass({
  mixins: [ImmutableMixin],

  render: function() {
    var props = this.props;
    var path = props.path;
    var form = props.form;
    var pathCounter = 0;
    var groups = group({
      content: form.get('content').toJS()
    });
    var groupsLength = groups.length;
    var haveSeenParagraph = false;
    var children = groups.map(function(group, index, groups) {
      var childAttributes = {
        key: group.type + '-' + index,
        // TODO: Can avoid re-casting to immutable type?
        content: Immutable.fromJS(group.content),
        path: path.push('content'),
        offset: pathCounter
      };

      if (group.type === 'series') {
        childAttributes.followed = notLastInArray(index, groups) &&
          groups.slice(index).some(function(laterGroup) {
            return laterGroup.type === 'paragraph';
          });
        childAttributes.preceded = haveSeenParagraph;
      } else {
        haveSeenParagraph = true;
      }

      childAttributes.only = (groupsLength === 1);

      pathCounter = pathCounter + group.content.length;
      return group.type === 'paragraph' ?
        React.createElement(Paragraph, childAttributes) :
        React.createElement(Series, childAttributes);
    });
    return React.DOM.div({
      key: 'div',
      className: 'form',
      path: path
    }, children);
  }
});
