module.exports = [
  {
    name: 'archaic',
    default: true,
    annotate: require('commonform-archaic'),
    summary: 'Annotate archaic words and phrases.'
  },
  {
    name: 'wordy',
    default: true,
    annotate: require('commonform-wordy'),
    summary: 'Annotate needlessly wordy language.'
  },
  {
    name: 'doubleplus-numbers',
    default: true,
    annotate: require('commonform-archaic'),
    summary: 'Annotate redundancies like “ten (10)”.'
  },
  {
    name: 'lint',
    default: true,
    annotate: require('commonform-lint'),
    summary: (
      'Annotate structural issues ' +
      'like undefined terms and broken cross-references.'
    )
  },
  {
    name: 'MSCD',
    default: false,
    annotate: require('commonform-mscd'),
    summary: (
      'Annotate usages discouraged by Ken Adams\'' +
      'Manual of Style for Contract Drafting.'
    )
  }
]
