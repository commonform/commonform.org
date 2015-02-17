var React = require('react');

var DOM = React.DOM;
var span = DOM.span;
var kbd = DOM.kbd;

module.exports = React.createClass({
  render: function() {
    return DOM.div({
      key: 'typingGuide',
      className: 'typingGuide panel panel-info'
    }, [
      DOM.div({
        key: 'heading',
        className: 'panel-heading'
      }, 'Typing Guide'),
      DOM.div({
        key: 'body',
        className: 'panel-body'
      },
        DOM.ul({key: 'list', className: 'list-inline'}, [
        DOM.li({key: 'definition'}, [
          span({key: 'lead'}, 'Define terms with double quotes, like '),
          kbd({key: 'keys'}, '""Agreement""'),
          span({key: 'period'}, '.')
        ]),
        DOM.li({key: 'use'},
          span({key: 'lead'}, 'Use defined terms with chevrons, like '),
          kbd({key: 'keys'}, '<Consideration>'),
          span({key: 'period'}, '.')
        ),
        DOM.li({key: 'field'},
          span({key: 'lead'}, 'Insert blanks with brackets, like '),
          kbd({key: 'keys'}, ['[Company Name]']),
          span({key: 'period'}, '.')
        ),
        DOM.li({key: 'reference'},
          span({key: 'lead'}, 'Reference forms with braces, like '),
          kbd({key: 'keys'}, ['{Indemnification}']),
          span({key: 'period'}, '.')
        )
        ])
      )
    ]);
  }
});
