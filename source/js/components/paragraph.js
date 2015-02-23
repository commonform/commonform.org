var React = require('react');

var ParagraphButton = require('./paragraph-button');
var ParagraphContent = require('./paragraph-content');
var ParagraphIssues = require('./paragraph-issues');
var TermsDefined = require('./terms-defined');
var depthOfPath = require('../helpers/depth-of-path');

var ANNOTATIONS_WIDTH = 5;

module.exports = React.createClass({
  displayName: 'Paragraph',

  render: function() {
    var props = this.props;
    var path = props.path;
    var depth = depthOfPath(path);
    var width = 12 - ANNOTATIONS_WIDTH - depth;
    var offset = props.offset;
    var content = props.content;
    return React.DOM.div({className: 'row'}, [
      React.DOM.div({
        key: 'offset',
        className: 'col-sm-offset-' + depth + ' col-sm-' + width
      }, [
        React.createElement(ParagraphButton, {
          key: 'button',
          length: content.count(),
          offset: offset,
          only: props.only,
          path: path
        }),
        React.createElement(ParagraphContent, {
          content: content,
          key: 'content',
          offset: offset,
          path: path
        })
      ]),
      React.DOM.div({
        key: 'marginalia',
        className: 'marginalia col-sm-' + ANNOTATIONS_WIDTH
      }, [
        React.createElement(TermsDefined),
        React.createElement(ParagraphIssues)
      ])
    ]);
  }
});
