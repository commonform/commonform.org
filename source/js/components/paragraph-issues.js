var ImmutableMixin = require('react-immutable-render-mixin');
var React = require('react');

module.exports = React.createClass({
  displayName: 'ParagraphIssues',

  mixins: [ImmutableMixin],

  render: function() {
    var issuesTree = this.props.issuesTree;
    return issuesTree.count() > 0 ?
      React.DOM.ul({
        className: 'paragraphIssues list-group'
      },
      issuesTree.valueSeq().reduce(function(mem, value, pathIndex) {
        return value.reduce(function(mem, issue, issueIndex) {
          return mem.concat([
            React.DOM.li({
              key: pathIndex + '.' + issueIndex,
              className: 'list-group-item list-group-item-danger'
            }, [
              issue.get('message')
            ])
          ]);
        }, mem);
      }, [])
    ) :
    null;
  }
});
