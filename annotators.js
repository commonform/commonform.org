module.exports = [
  {
    name: 'archaic',
    default: true,
    annotate: require('commonform-archaic'),
    summary: 'archaism'
  },
  {
    name: 'wordy',
    default: true,
    annotate: require('commonform-wordy'),
    summary: 'wordiness'
  },
  {
    name: 'doubleplus-numbers',
    default: true,
    annotate: require('doubleplus-numbers'),
    summary: '“ten (10)”'
  },
  {
    name: 'lint',
    default: true,
    annotate: require('commonform-lint'),
    summary: 'structural issues'
  },
  {
    name: 'MSCD',
    default: false,
    annotate: require('commonform-mscd'),
    summary: 'MSCD'
  }
]
