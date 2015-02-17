var React = require('react');

var formChange = require('../actions/form-change');
var glyphicon = React.createFactory(require('./glyphicon'));

var DOM = React.DOM;

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
    return DOM.li({
      key: 'li',
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
