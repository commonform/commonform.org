var React = require('react');
var Project = require('./components/project');

document.addEventListener('DOMContentLoaded', function() {
  React.initializeTouchEvents(true);
  var element = document.getElementsByClassName('application')[0];
  React.render(React.createElement(Project), element);
});
