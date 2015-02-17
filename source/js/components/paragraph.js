var React = require('react');

var ParagraphButton = require('./paragraph-button');
var ParagraphContent = require('./paragraph-content');

module.exports = React.createClass({
  render: function() {
    var props = this.props;
    var path = props.path;
    var offset = props.offset;
    var content = props.content;
    // TODO: Children derive content.length
    var length = content.count();
    return React.DOM.div({className: 'row'}, [
      React.createElement(ParagraphButton, {
        key: 'button',
        length: length,
        offset: offset,
        only: this.props.only,
        path: path
      }),
      React.createElement(ParagraphContent, {
        key: 'content',
        content: content,
        length: length,
        offset: offset,
        path: path
      })
    ]);
  }
});
