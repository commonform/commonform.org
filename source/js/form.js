var React = require('react');
var group = require('commonform-group-series');

var Paragraph = require('./paragraph');
var Series = require('./series');

module.exports = React.createClass({
  render: function() {
    var path = this.props.path;
    var attributes = {
      className: 'form',
      path: path
    };
    var groups = group({content: this.props.content});
    var pathCounter = 0;
    var children = groups.map(function(element) {
      var childPath = path.concat(pathCounter++);
      var childAttributes = {
        content: element.content,
        path: childPath,
        key: childPath.join('.')
      };
      return element.type === 'paragraph' ?
        React.createElement(Paragraph, childAttributes) :
        React.createElement(Series, childAttributes);
    });
    return React.DOM.div(attributes, children);
  }
});
