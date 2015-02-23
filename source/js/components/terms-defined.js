var ImmutableMixin = require('react-immutable-render-mixin');
var React = require('react');
var predicate = require('commonform-predicate');

module.exports = React.createClass({
  displayName: 'TermsDefined',

  mixins: [ImmutableMixin],

  render: function() {
    var terms = this.props.content.reduce(function(terms, element) {
      return predicate.definition(element) ?
        terms.concat('“' + element.get('definition') + '‟') : terms;
    }, []);
    return terms.length === 0 ?
      false :
      React.DOM.div({className: 'termsDefined'}, [
        terms.join(', ')
      ]);
  }
});
