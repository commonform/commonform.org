var React = require('react');

var Summary = require('./summary');
var FormButton = require('./form-button');

var attributes = {className: 'subForm'};

module.exports = React.createClass({
  render: function() {
    var path = this.props.path;
    var subForm = this.props.subForm;
    var followed = this.props.followed;
    var preceded = this.props.preceded;
    return React.DOM.div(attributes, [
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
              followed: followed,
              preceded: preceded,
              only: this.props.only,
              path: this.props.path
            }),
            React.createElement(Summary, {
              key: 'summary',
              summary: subForm.summary,
              path: this.props.path.concat('summary')
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
            form: subForm.form,
            path: path.concat('form')
          })
        ])
      ])
    ]);
  }
});
