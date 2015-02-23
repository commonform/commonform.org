var ImmutableMixin = require('react-immutable-render-mixin');
var React = require('react');

module.exports = React.createClass({
  displayName: 'ParagraphIssues',

  mixins: [ImmutableMixin],

  render: function() {
    return React.DOM.div({className: 'paragraphIssues'}, [
      '(Paragraph Issues)'
    ]);
  }
});
