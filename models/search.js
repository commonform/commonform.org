var simpleQuery = require('../queries/simple')

var API = 'https://api.commonform.org'

module.exports = function (initialize, reduction, handler) {
  initialize({
    action: null,
    value: null,
    query: null,
    results: null
  })

  reduction('results', function (data, state) {
    return data
  })

  handler('definitions', function (term, state, reduce, done) {
    var encoded = encodeURIComponent(term)
    var url = API + '/terms/' + encoded + '/definitions'
    var path = '/search/definitions/' + encoded
    simpleQuery(url, function (error, digests) {
      if (error) {
        done(error)
      } else {
        reduce('results', {
          action: 'definitions',
          value: term,
          query: 'definitions of the term ' + '“' + term + '”',
          results: digests.map(function (digest) {
            return {
              type: 'digest',
              value: digest
            }
          })
        })
        window.history.pushState({}, '', path)
        done()
      }
    })
  })

  handler('terms', function (prefix, state, reduce, done) {
    var encoded = encodeURIComponent(prefix)
    var path = '/search/terms/' + encoded
    var url = API + '/terms?prefix=' + encoded
    simpleQuery(url, function (error, terms) {
      if (error) {
        done(error)
      } else {
        reduce('results', {
          action: 'terms',
          value: prefix,
          query: 'defined terms starting with ' + '“' + prefix + '”',
          results: terms.map(function (term) {
            return {
              type: 'term',
              value: term
            }
          })
        })
        window.history.pushState({}, '', path)
        done()
      }
    })
  })

  handler('headings', function (prefix, state, reduce, done) {
    var encoded = encodeURIComponent(prefix)
    var path = '/search/headings/' + encoded
    var url = API + '/headings?prefix=' + encoded
    simpleQuery(url, function (error, headings) {
      if (error) {
        done(error)
      } else {
        reduce('results', {
          action: 'headings',
          value: prefix,
          query: 'headings starting with ' + '“' + prefix + '”',
          results: headings.map(function (heading) {
            return {
              type: 'heading',
              value: heading
            }
          })
        })
        window.history.pushState({}, '', path)
        done()
      }
    })
  })

  handler('forms', function (heading, state, reduce, done) {
    var encoded = encodeURIComponent(heading)
    var path = '/search/forms/' + encoded
    var url = API + '/headings/' + encoded + '/forms'
    simpleQuery(url, function (error, forms) {
      if (error) {
        done(error)
      } else {
        reduce('results', {
          action: 'forms',
          value: heading,
          query: 'forms with the heading ' + '“' + heading + '”',
          results: forms.map(function (form) {
            return {
              type: 'digest',
              value: form.digest
            }
          })
        })
        window.history.pushState({}, '', path)
        done()
      }
    })
  })
}
