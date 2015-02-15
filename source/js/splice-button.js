var formChange = require('./form-change');

module.exports = React.createClass({
  propTypes: {
    path: React.PropTypes.array.isRequired
  },
  onClick: function(event) {
    event.preventDefault();
    console.log(this.props);
    formChange({
      type: 'splice',
      path: this.props.path,
      offset: this.props.offset,
      length: this.props.length
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
