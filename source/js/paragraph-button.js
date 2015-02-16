var React = require('react');
var SpliceButton = require('./splice-button');
var SiblingButton = require('./sibling-button');

module.exports = React.createClass({
  render: function() {
    var path = this.props.path;
    var offset = this.props.offset;
    var length = this.props.length;
    return React.DOM.div({
      className: 'btn-group col-sm-1',
    }, [
      React.DOM.button({
        className: 'btn btn-default dropdown-toggle',
        type: 'button',
        'data-toggle': 'dropdown'
      }, [
        React.DOM.strong({}, '¶')
      ]),
      React.DOM.ul({
        className: 'dropdown-menu',
        role: 'menu'
      }, [
        React.createElement(SiblingButton, {
          path: path.concat(offset),
          above: true
        }),
        React.createElement(SiblingButton, {
          path: path.concat(offset + length),
          above: false
        }),
        this.props.only || React.DOM.li({
          className: 'divider'
        }),
        this.props.only || React.createElement(SpliceButton, {
          path: path,
          offset: offset,
          length: length
        })
      ])
    ]);
  }
});
