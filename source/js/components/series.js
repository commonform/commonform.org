var React = require('react');
var hash = require('commonform-hash');
var normalize = require('commonform-normalize');

var SubForm = require('./sub-form');

module.exports = React.createClass({
  render: function() {
    var path = this.props.path;
    var offset = this.props.offset;
    var followed = this.props.followed;
    var preceded = this.props.preceded;
    var only = this.props.only;
    var children = this.props.content.map(function(subForm, index, a) {
      var subFormPath = path.concat(offset + index);
      var digest = hash.hash(normalize(subForm.form));
      var childAttributes = {
        key: subForm.summary + ':' + digest,
        only: only,
        path: subFormPath,
        subForm: subForm
      };
      childAttributes.followed = (index === a.length - 1) && followed;
      childAttributes.preceded = (index === 0) && preceded;
      var childPath = subFormPath.concat('content', index);
      return React.createElement(SubForm, childAttributes, childPath);
    });
    return React.DOM.div({
      key: 'div',
      className: 'series'
    }, children);
  }
});
