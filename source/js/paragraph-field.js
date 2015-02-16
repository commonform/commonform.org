var debounce = require('just-debounce');
var formChange = require('./form-change');

module.exports = React.createClass({
  componentWillMount: function() {
    this.debouncedOnChange = debounce(function() {

    }, 500);
  },
  render: function() {
    var attributes = {
      className: 'paragraph form-control',
      defaultValue: this.props.content.map(function(element) {
        if (typeof element === 'string') {
          return element;
        } else if ('use' in element) {
          return '<' + element.use + '>';
        } else if ('definition' in element) {
          return '""' + element.definition + '""';
        } else if ('reference' in element) {
          return '{' + element.reference + '}';
        } else if ('field' in element) {
          return '[' + element.field + ']';
        } else {
          throw new Error('Unknown content type');
        }
      }).join('')
    };
    return React.DOM.div({className: 'col-sm-11'},
      React.DOM.textarea(attributes)
    );
  }
});
