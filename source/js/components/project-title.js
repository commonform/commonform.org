var React = require('react');
var titleChange = require('../actions/title-change');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      title: this.props.title
    };
  },

  handleBlur: function(event) {
    titleChange(event.target.value);
  },

  handleChange: function(event) {
    this.setState({title: event.target.value});
  },

  render: function() {
    return React.DOM.div({
      key: 'titleDiv',
      className: 'container'
    }, [
      React.DOM.form({
        key: 'form'
      }, [
        React.DOM.input({
          key: 'title',
          className: 'pageTitle form-control',
          onChange: this.handleChange,
          onBlur: this.handleBlur,
          value: this.state.title
        })
      ])
    ]);
  }
});
