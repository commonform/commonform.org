var React = require('react');

var Types = React.PropTypes;
var div = React.DOM.div;

module.exports = React.createClass({
  propTypes: {
    type: Types.oneOf(['success', 'info', 'warning', 'danger']),
    heading: Types.string
  },

  render: function() {
    var props = this.props;
    var type = props.type;
    var heading = props.heading;
    return div({
      className: 'panel' + (type ? ' panel-' + type : '')
    }, [
      heading ?
        div({
          className: 'panel-heading',
          key: 'heading'
        }, [heading]) :
        null,
      div({
        className: 'panel-body',
        key: 'body'
      }, [this.props.children])
    ]);
  }
});
