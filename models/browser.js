var asyncMap = require('async.map')
var getEditions = require('../queries/editions')
var getProjects = require('../queries/projects')
var getPublishers = require('../queries/publishers')

module.exports = function (initialize, reduction, handler) {
  initialize({
    projects: null,
    publisher: null,
    publishers: null
  })

  reduction('publishers', function (publishers, state) {
    return {publishers: publishers}
  })

  handler('get publishers', function (action, state, reduce, done) {
    getPublishers(function (error, publishers) {
      if (error) {
        done(error)
      } else {
        reduce('publishers', publishers)
        done()
      }
    })
  })

  reduction('projects', function (data, state) {
    return {
      publishers: null,
      publisher: data.publisher,
      projects: data.projects
    }
  })

  handler('get projects', function (publisher, state, reduce, done) {
    getProjects(publisher, function (error, projects) {
      if (error) {
        done(error)
      } else {
        asyncMap(projects, fetchEditions, function (error, projects) {
          if (error) {
            done(error)
          } else {
            var data = {
              publisher: publisher,
              projects: projects
            }
            reduce('projects', data, done)
            done()
          }
        })
      }
      function fetchEditions (project, done) {
        getEditions(publisher, project, function (error, editions) {
          if (error) {
            done(error)
          } else {
            done(null, {
              name: project,
              editions: editions
            })
          }
        })
      }
    })
  })
}
