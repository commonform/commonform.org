var ParagraphButton = require('./paragraph-button');
var ParagraphContent = require('./paragraph-content');

module.exports = React.createClass({
  render: function() {
    var path = this.props.path;
    var offset = this.props.offset;
    var content = this.props.content;
    return React.DOM.div({className: 'row'}, [
      React.createElement(ParagraphButton, {
        length: this.props.content.length,
        offset: offset,
        only: this.props.only,
        path: path
      }),
      React.createElement(ParagraphContent, {
        content: content,
        length: content.length,
        offset: offset,
        path: path
      })
    ]);
  }
});
