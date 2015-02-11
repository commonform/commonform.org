var Summary = require('./summary');

var attributes = {className: 'subForm'};

module.exports = React.createClass({
  render: function() {
    var subForm = this.props.subForm;
    var children = [
      React.createElement(require('./form'), subForm.form)
    ];
    if ('summary' in subForm) {
      children.unshift(
        React.createElement(Summary, {summary: subForm.summary})
      );
    }
    return React.DOM.div(attributes, children);
  }
});
