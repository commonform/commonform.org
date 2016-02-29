module.exports = projects

var h = require('virtual-dom/h')

function projects(projects) {
  return h('p',
    projects.map(project)) }

function project(project) {
  return h('p.project',
    [ h('strong', project.publisher),
      ' published this Common Form as ',
      h('strong', project.project + ' ' + project.edition) ]) }
