var Immutable = require('immutable');
var React = require('react');
var markup = require('commonform-markup');

var TextArea = require('./text-area');
var TypingGuide = require('./typing-guide');
var componentFor = require('../helpers/component-for-content');
var formChange = require('../actions/form-change');
var sanitize = require('../helpers/sanitize-string');

module.exports = React.createClass({
  displayName: 'ParagraphContent',

  getInitialState: function() {
    var props = this.props;
    return {
      editing: false,
      content: props.content,
      length: props.content.count(),
      textContent: markup.toMarkup({content: props.content.toJS()})
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
    var newContent = Immutable.fromJS(
      markup.parseMarkup(sanitize(text)).content
    );
    this.setState({editing: false}, function() {
      formChange({
        type: 'splice',
        path: props.path,
        offset: props.offset,
        length: this.state.length,
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
      length: newProps.content.count(),
      textContent: markup.toMarkup({content: newProps.content.toJS()})
    });
  },

  render: function() {
    var content = this.state.content;
    return React.DOM.div({
      key: 'width',
      className: 'paragraph col-sm-11'
    }, [
      React.DOM.div({
        key: 'contentRow',
        className: 'row'
      }, [
        React.DOM.p({
          key: 'p',
          className: 'col-sm-12' +
            (!this.state.editing ? '' : ' hidden'),
          onDoubleClick: this.handleClick,
        }, content.map(function(element, index) {
          return componentFor(element, index);
        }).toArray()),
        React.createElement(TextArea, {
          key: 'textarea',
          className: 'col-sm-12' + (this.state.editing ? '' : ' hidden'),
          onBlur: this.handleBlur,
          onChange: this.handleChange,
          ref: 'textarea',
          spellCheck: 'true',
          value: this.state.textContent
        })
      ]),
      !this.state.editing || React.DOM.div({
        key: 'guideRow',
        className: 'row'
      }, [
        React.createElement(TypingGuide, {key: 'guide'})
      ])
    ]);
  }
});
