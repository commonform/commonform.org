var React = require('react');

var ParagraphButton = require('./paragraph-button');
var ParagraphContent = require('./paragraph-content');

module.exports = React.createClass({
  displayName: 'Paragraph',

  render: function() {
    var props = this.props;
    var path = props.path;
    var offset = props.offset;
    var content = props.content;
    return React.DOM.div({className: 'row'}, [
      React.createElement(ParagraphButton, {
        key: 'button',
        length: content.count(),
        offset: offset,
        only: props.only,
        path: path
      }),
      React.createElement(ParagraphContent, {
        content: content,
        key: 'content',
        offset: offset,
        path: path
      })
    ]);
  }
});
