var React = require('react');
var DeleteButton = require('./delete-button');
var SiblingButton = require('./sibling-button');

module.exports = React.createClass({
  render: function() {
    var path = this.props.path;
    var followed = this.props.followed;
    var preceded = this.props.preceded;
    return React.DOM.div({
      className: 'btn-group col-sm-1',
    }, [
      React.DOM.button({
        className: 'btn btn-default dropdown-toggle',
        type: 'button',
        'data-toggle': 'dropdown'
      }, [
        React.DOM.strong({}, '§')
      ]),
      React.DOM.ul({
        className: 'dropdown-menu',
        role: 'menu'
      }, [
        preceded || React.createElement(SiblingButton, {
          path: path,
          form: false,
          above: true
        }),
        React.createElement(SiblingButton, {
          path: path,
          form: true,
          above: true
        }),
        React.createElement(SiblingButton, {
          path: path,
          form: true,
          above: false
        }),
        followed || React.createElement(SiblingButton, {
          path: path,
          form: false,
          above: false
        }),
        this.props.only || React.DOM.li({
          className: 'divider'
        }),
        this.props.only || React.createElement(DeleteButton, {
          path: path
        })
      ])
    ]);
  }
});
