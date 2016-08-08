var downloadPublication = require('../queries/publication')

module.exports = {
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
