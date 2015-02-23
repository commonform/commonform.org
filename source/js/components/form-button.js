var React = require('react');

var DeleteButton = require('./delete-button');
var SiblingButton = require('./sibling-button');
var depthOfPath = require('../helpers/depth-of-path');
var MAX_DEPTH = require('../helpers/constants').MAX_DEPTH;

var DOM = React.DOM;

module.exports = React.createClass({
  displayName: 'FormButton',

  render: function() {
    var props = this.props;
    var path = props.path;
    var depth = depthOfPath(path);
    var followed = props.followed;
    var preceded = props.preceded;
    var children = [
    ];
    if (depth < MAX_DEPTH) {
      children = children.concat([
        preceded || React.createElement(SiblingButton, {
          key: 'paragraphAbove',
          path: path,
          form: false,
          above: true
        }),
        React.createElement(SiblingButton, {
          key: 'formAbove',
          path: path,
          form: true,
          above: true
        }),
        React.createElement(SiblingButton, {
          key: 'formBelow',
          path: path,
          form: true,
          above: false
        }),
        followed || React.createElement(SiblingButton, {
          key: 'paragraphBelow',
          path: path,
          form: false,
          above: false
        })
      ]);
    }

    if (!props.only) {
      if (children.lenght > 0) {
        children.push(DOM.li({
          key: 'divider',
          className: 'divider'
        }));
      }
      children.push(React.createElement(DeleteButton, {
        key: 'delete',
        path: path
      }));
    }

    return DOM.div({
      key: 'buttonGroup',
      className: 'btn-group col-sm-1',
    }, [
      DOM.button({
        key: 'button',
        className: 'btn btn-default dropdown-toggle',
        type: 'button',
        'data-toggle': 'dropdown'
      }, [
        DOM.strong({key: 'sigil'}, '§')
      ]),
      DOM.ul({
        key: 'menu',
        className: 'dropdown-menu',
        role: 'menu'
      }, children)
    ]);
  }
});
