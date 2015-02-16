var Project = require('./project');

document.addEventListener('DOMContentLoaded', function() {
  React.initializeTouchEvents(true);
  var element = document.getElementsByClassName('application')[0];
  React.render(React.createElement(Project), element);
});
