var DeleteButton = require('./delete-button');
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
        React.DOM.li({className: 'divider'}),
        React.createElement(DeleteButton, {path: path})
      ])
    ]);
  }
});
