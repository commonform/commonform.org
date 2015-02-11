var componentFor = require('./component-for-content');

var attributes = {className: 'paragraph'};

module.exports = React.createClass({
  render: function() {
    var path = this.props.path;
    var children = this.props.content.map(function(element, index) {
      return componentFor(element, path.concat(index));
    });
    return React.DOM.p(attributes, children);
  }
});
