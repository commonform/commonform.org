var React = require('react');

var SiblingButton = require('./sibling-button');
var SpliceButton = require('./splice-button');
var depthOfPath = require('../helpers/depth-of-path');
var MAX_DEPTH = require('../helpers/constants').MAX_DEPTH;

module.exports = React.createClass({
  displayName: 'ParagraphButton',

  render: function() {
    var props = this.props;
    var path = props.path;
    var depth = depthOfPath(path);
    var offset = props.offset;
    var length = props.length;
    var children = [];

    if (depth < MAX_DEPTH) {
      children = children.concat([
        React.createElement(SiblingButton, {
          key: 'formAbove',
          path: path.push(offset),
          above: true
        }),
        React.createElement(SiblingButton, {
          key: 'formBelow',
          path: path.push(offset + length),
          above: false
        })
      ]);
    }

    if (!this.props.only) {
      if (children.length > 0) {
        children.push(React.DOM.li({
          key: 'divider',
          className: 'divider'
        }));
      }
      children.push(React.createElement(SpliceButton, {
        key: 'splice',
        path: path,
        offset: offset,
        length: length
      }));
    }

    return React.DOM.div({
      key: 'div',
      className: 'btn-group col-sm-1',
    }, [
      React.DOM.button({
        key: 'toggle',
        className: 'btn btn-default dropdown-toggle',
        type: 'button',
        'data-toggle': 'dropdown'
      }, [React.DOM.strong({key: 'pilcrow'}, '¶')]),
      React.DOM.ul({
        key: 'ul',
        className: 'dropdown-menu',
        role: 'menu'
      }, children)
    ]);
  }
});
