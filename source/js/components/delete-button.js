var React = require('react');

var formChange = require('../actions/form-change');
var glyphicon = React.createFactory(require('./glyphicon'));

var DOM = React.DOM;

module.exports = React.createClass({
  displayName: 'DeleteButton',

  onClick: function(event) {
    event.preventDefault();
    formChange({
      type: 'del',
      path: this.props.path
    });
  },

  render: function() {
    return DOM.li({
      key: 'deleteButton',
      className: 'delete-button',
      href: '#'
    }, [
      DOM.a({
        key: 'a',
        href: '#',
        onClick: this.onClick
      }, [
        glyphicon({
          key: 'icon',
          icon: 'trash'
        }),
        DOM.span({
          key: 'text'
        }, ' Delete')
      ])
    ]);
  }
});
