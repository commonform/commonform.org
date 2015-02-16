var React = require('react');

var DOM = React.DOM;

module.exports = React.createClass({
  render: function() {
    return DOM.div({
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
        DOM.p({key: 'definition'}, [
          DOM.span({key: 'lead'},
            'Define terms with double-double quotes, like '
          ),
          DOM.kbd({key: 'keys'}, ['""Agreement""']),
          DOM.span({key: 'period'}, ['.'])
        ]),
        DOM.p({key: 'use'},
          DOM.span({key: 'lead'}, [
            'Use defined terms with angle brackets, like '
          ]),
          DOM.kbd({key: 'keys'}, ['<Consideration>']),
          DOM.span({key: 'period'}, ['.'])
        ),
        DOM.p({key: 'field'},
          DOM.span({key: 'lead'}, [
            'Insert fill-in-the-blanks with square brackets, like ',
          ]),
          DOM.kbd({key: 'keys'}, ['[Company Name]']),
          DOM.span({key: 'period'}, ['.'])
        ),
        DOM.p({key: 'reference'},
          DOM.span({key: 'lead'}, [
            'Reference other forms by summary with braces, like '
          ]),
          DOM.kbd({key: 'keys'}, ['{Indemnification}']),
          DOM.span({key: 'period'}, ['.'])
        )
      )
    ]);
  }
});
