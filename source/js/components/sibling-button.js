var Immutable = require('immutable');
var React = require('react');

var formChange = require('../actions/form-change');
var glyphicon = React.createFactory(require('./glyphicon'));

var DOM = React.DOM;

var defaultParagraph = function() {
  return 'Added ' + new Date().toISOString();
};

var defaultForm = function() {
  return Immutable.fromJS({
    form: {
      content: [defaultParagraph()]
    }
  });
};

module.exports = React.createClass({
  displayName: 'SiblingButton',

  getDefaultProps: function() {
    return {
      form: true,
      above: true
    };
  },

  onClick: function(event) {
    event.preventDefault();
    var path = this.props.path;
    var index = path.last();
    if (!this.props.above) {
      index++;
    }
    var newValue = this.props.form ?
      defaultForm() : defaultParagraph();
    formChange({
      type: 'splice',
      offset: index,
      length: 0,
      path: path.pop(),
      value: newValue
    });
  },

  render: function() {
    var form = this.props.form;
    var above = this.props.above;
    return DOM.li({
      key: 'li',
      href: '#'
    }, [
      DOM.a({
        key: 'a',
        href: '#',
        onClick: this.onClick
      }, [
        glyphicon({
          key: 'icon',
          icon: above ? 'up' : 'down'
        }),
        DOM.span(
          {key: 'text'},
          ' Add ' +
            (form ? '§' : '¶') + ' ' +
            (above ? 'above' : 'below')
        )
      ])
    ]);
  }
});
