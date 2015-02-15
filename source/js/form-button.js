var DeleteButton = require('./delete-button');

module.exports = React.createClass({
  render: function() {
    var path = this.props.path;
    return React.DOM.div({
      className: 'btn-group',
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
        React.createElement(DeleteButton, {path: path})
      ])
    ]);
  }
});
