var React = require('react');

var formChange = require('../actions/form-change');
var glyphicon = React.createFactory(require('./glyphicon'));

module.exports = React.createClass({
  propTypes: {
    path: React.PropTypes.array.isRequired
  },

  onClick: function(event) {
    event.preventDefault();
    formChange({
      type: 'splice',
      path: this.props.path,
      offset: this.props.offset,
      length: this.props.length
    });
  },

  render: function() {
    return React.DOM.li({
      key: 'li',
      className: 'delete-button',
      href: '#'
    }, [
      React.DOM.a({
        key: 'a',
        href: '#',
        onClick: this.onClick
      }, [
        glyphicon({
          key: 'icon',
          icon: 'trash'
        }),
        React.DOM.span({key: 'text'}, ' Delete')
      ])
    ]);
  }
});
