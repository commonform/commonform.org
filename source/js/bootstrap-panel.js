var React = require('react');
var Types = React.PropTypes;
var DOM = React.DOM;

module.exports = React.createClass({
  propTypes: {
    type: Types.oneOf(['success', 'info', 'warning', 'danger']),
    heading: Types.string
  },

  render: function() {
    var type = this.props.type;
    return DOM.div({
      className: 'panel' + (type ? ' panel-' + type : '')
    }, [
      this.props.heading ?
        DOM.div({className: 'panel-heading'}, this.props.heading) :
        null,
      DOM.div({className: 'panel-body'}, this.props.children)
    ]);
  }
});
