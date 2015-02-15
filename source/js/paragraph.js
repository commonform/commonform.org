var componentFor = require('./component-for-content');
var ParagraphButton = require('./paragraph-button');

module.exports = React.createClass({
  render: function() {
    var path = this.props.path;
    var offset = this.props.offset;
    var children = this.props.content.map(function(element, index) {
      return componentFor(element, path.concat(offset + index));
    });
    var attributes = {
      className: 'paragraph col-sm-11',
      onDoubleClick: this.handleClick
    };
    return React.DOM.div(
      {className: 'row'},
      React.createElement(ParagraphButton, {
        path: path,
        offset: offset,
        length: this.props.content.length,
        only: this.props.only
      }),
      React.DOM.p(attributes, children)
    );
  }
});
