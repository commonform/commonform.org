var React = require('react');
var AddValueRow = require('./add-value-row');
var ValueRow = require('./value-row');
var panel = React.createFactory(require('./bootstrap-panel'));

var DOM = React.DOM;

module.exports = React.createClass({
  render: function() {
    var values = this.props.values;
    return DOM.div({
      className: 'container'
    }, [
      panel({
        key: 'panel',
        type: 'default',
        heading: 'Fill in the Blanks'
      }, [
        DOM.table({
          key: 'valuesTable table table-condensed',
          className: 'table'
        }, [
          DOM.thead({
            key: 'head'
          }, [
            DOM.tr({
              key: 'tr'
            }, [
              DOM.th({key: 'blank'}, 'Blank'),
              DOM.th({key: 'value'},  'Value'),
              DOM.th({key: 'action'},  'Action')
            ])
          ]),
          DOM.tbody({
            key: 'body'
          },
            Object.keys(values).sort().map(function(fieldName) {
              console.log(fieldName, values);
              return React.createElement(ValueRow, {
                key: fieldName,
                field: fieldName,
                value: values[fieldName]
              });
            }).concat(React.createElement(AddValueRow, {key: 'add'}))
          )
        ])
      ])
    ]);
  }
});
