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
      textContent: markup.stringify(Immutable.Map({
        content: props.content
      }))
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
    var newContent = markup.parse(sanitize(text)).get('content');
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
      textContent: markup.stringify(Immutable.Map({
        content: newProps.content
      }))
    });
  },

  render: function() {
    var state = this.state;
    var content = state.content;
    var editing = state.editing;
    return React.DOM.div({
      key: 'width',
      className: 'paragraph col-sm-' + this.props.width
    }, [
      React.DOM.div({
        key: 'contentRow',
        className: 'row'
      }, [
        React.DOM.p({
          key: 'p',
          className: 'col-sm-12' +
            (!editing ? '' : ' hidden'),
          onDoubleClick: this.handleClick,
        }, content.map(function(element, index) {
          return componentFor(element, index);
        }).toArray()),
        React.createElement(TextArea, {
          className: 'col-sm-12' + (editing ? '' : ' hidden'),
          key: 'textarea',
          onBlur: this.handleBlur,
          onChange: this.handleChange,
          ref: 'textarea',
          spellCheck: 'true',
          value: state.textContent
        })
      ]),
      !editing || React.DOM.div({
        key: 'guideRow',
        className: 'row'
      }, [
        React.createElement(TypingGuide, {key: 'guide'})
      ])
    ]);
  }
});
