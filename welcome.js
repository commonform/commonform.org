const annotate = require('./annotate')
const merkleize = require('commonform-merkleize')
const welcomeTree = require('commonform-welcome-form')

var welcome = module.exports = {
  tree: welcomeTree,
  annotations: annotate(welcomeTree),
  merkle: merkleize(welcomeTree)
}

welcome.digest = welcome.merkle.digest

