var asyncMap = require('async.map')
var ecb = require('ecb')
var getEditions = require('../queries/editions')
var getProjects = require('../queries/projects')
var getPublisher = require('../queries/publisher')
var getPublishers = require('../queries/publishers')
var runParallel = require('run-parallel')

module.exports = function (initialize, reduction, handler) {
  initialize(function () {
    return {
      about: null,
      projects: null,
      publisher: null,
      publishers: null
    }
  })

  reduction('publishers', function (publishers, state) {
    return {publishers: publishers}
  })

  handler('get publishers', function (action, state, reduce, done) {
    getPublishers(ecb(done, function (publishers) {
      reduce('publishers', publishers)
      done()
    }))
  })

  reduction('projects', function (data, state) {
    return {
      publishers: null,
      publisher: data.publisher,
      about: data.about,
      projects: data.projects
    }
  })

  handler('get projects', function (publisher, state, reduce, done) {
    runParallel(
      [
        function (done) {
          getProjects(publisher, ecb(done, function (projects) {
            asyncMap(projects, fetchEditions, done)
            function fetchEditions (project, done) {
              getEditions(
                publisher, project,
                ecb(done, function (editions) {
                  done(null, {
                    name: project,
                    editions: editions
                  })
                })
              )
            }
          }))
        },
        function (done) {
          getPublisher(publisher, function (error, result) {
            if (error) {
              done(null, {about: ''})
            } else {
              done(null, result)
            }
          })
        }
      ],
      ecb(done, function (results) {
        reduce('projects', {
          about: results[1].about,
          publisher: publisher,
          projects: results[0]
        })
        done()
      })
    )
  })
}
