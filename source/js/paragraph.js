var componentFor = require('./component-for-content');

module.exports = React.createClass({
  render: function() {
    var path = this.props.path;
    var offset = this.props.offset;
    var children = this.props.content.map(function(element, index) {
      return componentFor(element, path.concat(offset + index));
    });
    var attributes = {
      className: 'paragraph',
      onDoubleClick: this.handleClick
    };
    return React.DOM.p(attributes, children);
  }
});
