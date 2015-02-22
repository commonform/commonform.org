var React = require('react');
var hash = require('commonform-hash').hash;
var normalize = require('commonform-normalize');

var SubForm = require('./sub-form');

module.exports = React.createClass({
  displayName: 'Series',

  render: function() {
    var props = this.props;
    var path = props.path;
    var offset = props.offset;
    var followed = props.followed;
    var content = props.content;
    var children = content.toArray().map(function(subForm, index, a) {
      var subFormPath = path.push(offset + index);
      // TODO: Check API
      var normalized = normalize(subForm.get('form'));
      var digest = hash(normalized.last());
      var childAttributes = {
        key: '' + index + ':' + subForm.get('summary') + ':' + digest,
        only: props.only,
        path: subFormPath,
        subForm: subForm
      };
      childAttributes.followed = (index === a.length - 1) && followed;
      childAttributes.preceded = (index === 0) && props.preceded;
      var childPath = subFormPath.push('content', index);
      return React.createElement(SubForm, childAttributes, childPath);
    });
    return React.DOM.div({
      key: 'div',
      className: 'series'
    }, children);
  }
});
