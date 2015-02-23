var React = require('react');

var ParagraphButton = require('./paragraph-button');
var ParagraphContent = require('./paragraph-content');
var ParagraphIssues = require('./paragraph-issues');
var depthOfPath = require('../helpers/depth-of-path');

var ANNOTATIONS_WIDTH = 5;

module.exports = React.createClass({
  displayName: 'Paragraph',

  render: function() {
    var props = this.props;
    var path = props.path;
    var depth = depthOfPath(path);
    var issuesTree = props.issuesTree;
    var width = 12 - ANNOTATIONS_WIDTH - depth;
    var offset = props.offset;
    var content = props.content;
    return React.DOM.div({className: 'row'}, [
      React.createElement(ParagraphButton, {
        key: 'button',
        length: content.count(),
        offset: offset,
        only: props.only,
        depth: depth,
        path: path
      }),
      React.createElement(ParagraphContent, {
        content: content,
        key: 'content',
        offset: offset,
        width: width - 1,
        path: path
      }),
      React.DOM.div({
        key: 'marginalia',
        className: 'marginalia col-sm-' + ANNOTATIONS_WIDTH
      }, [
        React.createElement(ParagraphIssues, {
          key: 'issues',
          issuesTree: issuesTree
        })
      ])
    ]);
  }
});
