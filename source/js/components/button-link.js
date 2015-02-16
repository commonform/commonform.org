var React = require('react');
var glyphicon = React.createFactory(require('./glyphicon'));

var DOM = React.DOM;

module.exports = React.createClass({
  propTypes: {
    icon: React.PropTypes.string.isRequired,
    text: React.PropTypes.string.isRequired,
  },

  render: function() {
    return DOM.a({
      key: 'buttonLink',
      className: 'btn btn-default',
      onClick: this.props.onClick
    }, [
      glyphicon({
        key: 'icon',
        icon: this.props.icon
      }),
      DOM.span({
        key: 'text'
      }, ' ' + this.props.text)
    ]);
  }
});
