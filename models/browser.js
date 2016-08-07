var downloadEditions = require('../queries/editions')
var downloadProjects = require('../queries/projects')
var downloadPublishers = require('../queries/publishers')
var runParallel = require('run-parallel')

module.exports = {
  namespace: 'browser',

  state: {
    publisher: null,
    publishers: null,
    projects: null
  },

  reducers: {
    publishers: function (action, state) {
      return action
    },

    projects: function (action, state) {
      return {
        publishers: null,
        publisher: action.publisher,
        projects: action.projects
      }
    }
  },

  effects: {
    fetch: function (action, state, send, done) {
      var type = action.type
      if (type === 'publishers') {
        downloadPublishers(function (error, publishers) {
          if (error) {
            done(error)
          } else {
            var payload = {
              publishers: publishers
            }
            send('browser:publishers', payload, done)
          }
        })
      } else if (type === 'projects') {
        var publisher = action.publisher
        downloadProjects(publisher, function (error, projects) {
          if (error) {
            done(error)
          } else {
            runParallel(
              projects.map(function (project) {
                return function (done) {
                  downloadEditions(
                    publisher, project,
                    function (error, editions) {
                      if (error) {
                        done(error)
                      } else {
                        done(null, {
                          name: project,
                          editions: editions
                        })
                      }
                    }
                  )
                }
              }),
              function (error, projects) {
                if (error) {
                  done(error)
                } else {
                  var payload = {
                    publisher: publisher,
                    projects: projects
                  }
                  send('browser:projects', payload, done)
                }
              }
            )
          }
        })
      }
    }
  }
}
