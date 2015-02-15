var group = require('commonform-group-series');
var validate = require('commonform-validate');

var Paragraph = require('./paragraph');
var Series = require('./series');

var notLastInArray = function(index, array) {
  return index < (array.length - 1);
};

module.exports = React.createClass({
  propTypes: {
    path: React.PropTypes.array.isRequired,
    form: function(props, propName) {
      if (!validate.nestedForm(props[propName])) {
        throw new Error('Invalid form');
      }
    }
  },
  render: function() {
    var path = this.props.path;
    var form = this.props.form;
    var pathCounter = 0;
    var groups = group({content: form.content});
    var children = groups.map(function(group, index, groups) {
      var childAttributes = {
        content: group.content,
        path: path.concat('content'),
        offset: pathCounter
      };

      if (group.type === 'series') {
        childAttributes.followed = notLastInArray(index, groups) &&
          groups.slice(index).some(function(laterGroup) {
            return laterGroup.type === 'paragraph';
          });
      }

      pathCounter = pathCounter + group.content.length;
      return group.type === 'paragraph' ?
        React.createElement(Paragraph, childAttributes) :
        React.createElement(Series, childAttributes);
    });
    return React.DOM.div({
      className: 'form',
      path: path
    }, children);
  }
});
