var React = require('react');
var Form = require('./form');

module.exports = React.createClass({
  render: function() {
    var form = React.createElement(Form, {
      content: this.props.form.content,
      conspicuous: this.props.form.conspicuous,
      path: this.props.path.concat('form')
    });
    return React.DOM.div({className: 'project'}, form);
  }
});
