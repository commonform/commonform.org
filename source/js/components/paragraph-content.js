var React = require('react');
var markup = require('commonform-markup');

var TextArea = require('./text-area');
var TypingGuide = require('./typing-guide');
var componentFor = require('../helpers/component-for-content');
var formChange = require('../actions/form-change');
var sanitize = require('../helpers/sanitize-string');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      editing: false,
      content: this.props.content,
      textContent: markup.toMarkup({content: this.props.content})
    };
  },

  handleClick: function() {
    var component = this;
    this.setState({editing: true}, function() {
      component.refs.textarea.getDOMNode().focus();
    });
  },

  handleBlur: function(event) {
    var props = this.props;
    var text = event.target.value;
    var newContent = markup.parseMarkup(sanitize(text)).content;
    this.setState({editing: false}, function() {
      formChange({
        type: 'splice',
        path: props.path,
        offset: props.offset,
        length: props.length,
        value: newContent
      });
    });
  },

  handleChange: function(event) {
    this.setState({textContent: event.target.value});
  },

  componentWillReceiveProps: function(newProps) {
    this.setState({
      content: newProps.content,
      textContent: markup.toMarkup({content: newProps.content})
    });
  },

  render: function() {
    var path = this.props.path;
    return React.DOM.div({className: 'paragraph col-sm-11'},
      React.DOM.div({className: 'row'},
        React.DOM.p({
          ref: 'p',
          className: 'col-sm-12' +
            (!this.state.editing ? '' : ' hidden'),
          onClick: this.handleClick,
        }, this.state.content.map(function(element, index) {
          return componentFor(element, path.concat(index));
        }).concat(' ')),
        React.createElement(TextArea, {
          className: 'col-sm-12' + (this.state.editing ? '' : ' hidden'),
          onBlur: this.handleBlur,
          onChange: this.handleChange,
          ref: 'textarea',
          spellCheck: 'true',
          value: this.state.textContent
        })
      ),
      !this.state.editing || React.DOM.div({className: 'row'},
        React.createElement(TypingGuide)
      )
    );
  }
});
