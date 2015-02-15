var formChange = require('./form-change');

module.exports = React.createClass({
  propTypes: {
    path: React.PropTypes.array.isRequired
  },
  onClick: function(event) {
    event.preventDefault();
    formChange({
      type: 'del',
      path: this.props.path
    });
  },
  render: function() {
    return React.DOM.li({
      className: 'delete-button',
      href: '#'
    }, [
      React.DOM.a({
        href: '#',
        onClick: this.onClick
      }, [
        React.DOM.span({
          className: 'glyphicon glyphicon-trash'
        }),
        ' Delete'
      ])
    ]);
  }
});
