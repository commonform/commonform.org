var DOM = React.DOM;

var p = function(argument) {
  return DOM.p(null, argument);
};

module.exports = React.createClass({
  render: function() {
    return DOM.div({
      className: 'typingGuide panel panel-info'
    }, [
      DOM.div({className: 'panel-heading'}, 'Typing Guide'),
      DOM.div({className: 'panel-body'},
        p('Define terms by surrounding them in double-double quotes, ' +
          'like ""Agreement"".'),
        p('Use defined terms by surrounding them in angle brackets, ' +
          'like  <Consideration>.'),
        p('Insert fill-in-the-blanks with square brackets, ' +
          'like [Company Name].'),
        p('Reference other forms by summary with braces, ' +
          'like {Indemnification}.')
      )
    ]);
  }
});
