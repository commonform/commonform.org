var Summary = require('./summary');
var FormButton = require('./form-button');

var attributes = {className: 'subForm'};

module.exports = React.createClass({
  render: function() {
    var path = this.props.path;
    var subForm = this.props.subForm;
    var children = [
      React.createElement(require('./form'), {
        form: subForm.form,
        path: path.concat('form')
      })
    ];
    if ('summary' in subForm) {
      children.unshift(
        React.createElement(Summary, {
          summary: subForm.summary,
          path: this.props.path.concat('summary')
        })
      );
    }
    children.unshift(
      React.createElement(FormButton, {
        subForm: subForm,
        path: this.props.path
      })
    );
    return React.DOM.div(attributes, children);
  }
});
