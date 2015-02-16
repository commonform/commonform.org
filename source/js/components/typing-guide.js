var React = require('react');

var DOM = React.DOM;

var kbd = function(argument) {
  return DOM.kbd(null, argument);
};

module.exports = React.createClass({
  render: function() {
    return DOM.div({
      className: 'typingGuide panel panel-info'
    }, [
      DOM.div({className: 'panel-heading'}, 'Typing Guide'),
      DOM.div({className: 'panel-body'},
        DOM.p(null,
          'Define terms by surrounding them in double-double quotes, ' +
          'like ', kbd('""Agreement""'), '.'
        ),
        DOM.p(null,
          'Use defined terms by surrounding them in angle brackets, ' +
          'like ', kbd('<Consideration>'), '.'
        ),
        DOM.p(null,
          'Insert fill-in-the-blanks with square brackets, ' +
          'like ', kbd('[Company Name]'), '.'
        ),
        DOM.p(null,
          'Reference other forms by summary with braces, ' +
          'like ', kbd('{Indemnification}'), '.'
        )
      )
    ]);
  }
});
