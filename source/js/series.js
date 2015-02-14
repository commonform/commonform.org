var SubForm = require('./sub-form');

var attributes = {className: 'series'};

module.exports = React.createClass({
  render: function() {
    var path = this.props.path;
    var offset = this.props.offset;
    var children = this.props.content.map(function(subForm, index) {
      var subFormPath = path.concat(offset + index);
      var childAttributes = {
        subForm: subForm,
        path: subFormPath
      };
      var childPath = subFormPath.concat('content', index);
      return React.createElement(SubForm, childAttributes, childPath);
    });
    return React.DOM.div(attributes, children);
  }
});
