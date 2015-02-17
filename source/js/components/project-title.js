var React = require('react');

var titleChange = require('../actions/title-change');

var DOM = React.DOM;

module.exports = React.createClass({
  getInitialState: function() {
    return {
      title: this.props.title
    };
  },

  handleBlur: function() {
    titleChange(this.state.title);
  },

  handleChange: function(event) {
    var value = event.target.value;
    if (value.length === 0) {
      value = 'Untitled Project';
    }
    this.setState({title: value});
  },

  handleSubmit: function(event) {
    event.preventDefault();
    this.handleBlur();
  },

  render: function() {
    return DOM.div({
      className: 'container',
      key: 'titleDiv'
    }, [
      DOM.form({
        key: 'form',
        onSubmit: this.handleSubmit
      }, [
        DOM.input({
          className: 'pageTitle form-control',
          key: 'title',
          onBlur: this.handleBlur,
          onChange: this.handleChange,
          onKeyDown: this.handleKeyDown,
          value: this.state.title
        })
      ])
    ]);
  }
});
