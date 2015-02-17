var ImmutableMixin = require('react-immutable-render-mixin');
var React = require('react');

var Summary = require('./summary');
var FormButton = require('./form-button');

module.exports = React.createClass({
  mixins: [ImmutableMixin],

  render: function() {
    var props = this.props;
    var path = props.path;
    var subForm = props.subForm;
    return React.DOM.div({
      className: 'subForm'
    }, [
      React.DOM.div({
        key: 'first',
        className: 'row'
      }, [
        React.DOM.div({
          key: 'fullWidth',
          className: 'col-sm-12'
        }, [
          React.DOM.div({
            key: 'row',
            className: 'row'
          }, [
            React.createElement(FormButton, {
              key: 'button',
              subForm: subForm,
              followed: props.followed,
              preceded: props.preceded,
              only: props.only,
              path: props.path
            }),
            React.createElement(Summary, {
              key: 'summary',
              summary: subForm.get('summary'),
              path: props.path.push('summary')
            })
          ]),
        ]),
      ]),
      React.DOM.div({
        key: 'second',
        className: 'row'
      }, [
        React.DOM.div({
          key: 'offset',
          className: 'col-sm-offset-1 col-sm-11'
        }, [
          React.createElement(require('./form'), {
            key: 'form',
            form: subForm.get('form'),
            path: path.push('form')
          })
        ])
      ])
    ]);
  }
});
