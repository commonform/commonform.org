var Immutable = require('immutable');
var React = require('react');

var formChange = require('../actions/form-change');
var glyphicon = React.createFactory(require('./glyphicon'));

var DOM = React.DOM;

module.exports = React.createClass({
  displayName: 'SpliceButton',

  onClick: function(event) {
    event.preventDefault();
    var props = this.props;
    formChange({
      type: 'splice',
      path: props.path,
      offset: props.offset,
      length: props.length,
      value: Immutable.List()
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
