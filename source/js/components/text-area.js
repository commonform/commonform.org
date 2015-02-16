// Based on Andrey Popp's react-textarea-resize
// Licensed per The MIT License
var React = require('react');
var objectAssign = require('object-assign');

module.exports = React.createClass({
  render: function() {
    var props = objectAssign({}, this.props, {
      onChange: this.onChange,
      style: objectAssign({}, this.props.style, {overflow: 'hidden'})
    });
    return React.DOM.textarea(props, this.props.children);
  },

  componentDidMount: function() {
    this.recalculateSize();
    window.addEventListener('resize', this.recalculateSize);
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.recalculateSize);
  },

  componentDidUpdate: function(prevProps) {
    if (
      prevProps.style ||
      prevProps.value !== this.props.value ||
      prevProps.className.indexOf('hidden') > -1 ||
      this.props.value === null
    ) {
      this.recalculateSize();
    }
  },

  onChange: function(e) {
    if (this.props.onChange) {
      this.props.onChange(e);
    }
    if (this.props.value === undefined) {
      this.recalculateSize();
    }
  },

  recalculateSize: function() {
    var diff;
    var node = this.getDOMNode();

    if (window.getComputedStyle) {
      var styles = window.getComputedStyle(node);
      if (
        styles.getPropertyValue('box-sizing') === 'border-box' ||
        styles.getPropertyValue('-moz-box-sizing') === 'border-box' ||
        styles.getPropertyValue('-webkit-box-sizing') === 'border-box'
      ) {
        diff = 0;
      } else {
        diff = (
          parseInt(styles.getPropertyValue('padding-bottom') || 0, 10) +
          parseInt(styles.getPropertyValue('padding-top') || 0, 10)
        );
      }
    } else {
      diff = 0;
    }

    node.style.height = 'auto';
    node.style.height = (node.scrollHeight - diff) + 'px';
  }
});
