var annotate = require('../utilities/annotate')
var merkleize = require('commonform-merkleize')
var diff = require('commonform-diff')
var downloadPublication = require('../queries/publication')

module.exports = {
  reducers: {
    displayForm: function (action, state) {
      var form = state.form
      return {
        location: {
          pathname: action.path
        },
        form: {
          annotations: annotate(action.tree),
          blanks: [],
          diff: form.hasOwnProperty('comparing')
          ? diff(action.tree, form.comparing.tree)
          : null,
          error: null,
          focused: null,
          merkle: action.merkle,
          mode: form.mode,
          path: [],
          projects: [],
          publications: action.publications || [],
          signaturePages: [],
          tree: action.tree
        }
      }
    }
  },

  effects: {
    redirect: function (action, state, send, done) {
      downloadPublication(action, function (error, digest) {
        if (error) {
          done(error)
        } else {
          var data = {location: '/forms/' + digest}
          send('location:setLocation', data, done)
        }
      })
    }
  }
}
