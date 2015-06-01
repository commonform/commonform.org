var React = require('react');

var Project = require('./components/project');

React.initializeTouchEvents();
var mount = document.getElementsByClassName('commonform').item(0);
React.render(React.createElement(Project), mount);
