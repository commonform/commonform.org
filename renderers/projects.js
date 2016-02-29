module.exports = projects

var h = require('virtual-dom/h')
var spell = require('reviewers-edition-spell')

function projects(projects) {
  return h('p',
    projects.map(project)) }

function project(project) {
  return h('p.project',
    [ h('strong', project.publisher),
      ' published this Common Form as ',
      h('strong', [
        project.project + ' ',
        h('abbr',
          { title: spell(project.edition) },
          project.edition) ]) ]) }
