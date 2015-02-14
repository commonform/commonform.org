var iconLI = function(icon, text) {
  return React.DOM.li({}, [
    React.DOM.a({
      href: '#'
    }, [
      React.DOM.span({
        className: 'glyphicon glyphicon-' + icon
      }),
      ' ' + text
    ])
  ]);
};

module.exports = React.createClass({
  render: function() {
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
        iconLI('trash', 'Delete')
      ])
    ]);
  }
});
