#!/usr/bin/env node
const AJV = require('ajv')
const commonmark = require('commonform-commonmark')
const docx = require('commonform-docx')
const ejs = require('ejs')
const fs = require('fs')
const glob = require('glob')
const grayMatter = require('gray-matter')
const hash = require('commonform-hash')
const loadComponents = require('commonform-load-components')
const ooxmlSignaturePages = require('ooxml-signature-pages')
const path = require('path')
const revedCompare = require('reviewers-edition-compare')
const revedSpell = require('reviewers-edition-spell')
const rimraf = require('rimraf')
const runSeries = require('run-series')
const toHTML = require('commonform-html')

const numberings = {
  decimal: require('decimal-numbering'),
  outline: require('outline-numbering'),
}

const ajv = new AJV()
const validateFrontMatter = ajv.compile(
  require('./schemas/front-matter'),
)

rimraf.sync('site')

fs.mkdirSync('site', { recursive: true })

const templates = {}
glob.sync('templates/*.ejs').forEach((file) => {
  const basename = path.basename(file, '.ejs')
  templates[basename] = fs.readFileSync(file, 'utf8')
})

const publishers = {}

const formFiles = glob.sync('forms/**/*.md')

const forms = formFiles.map((file) => {
  const contents = fs.readFileSync(file, 'utf8')
  const parsed = grayMatter(contents)
  const markup = parsed.content
  const frontMatter = parsed.data
  if (!validateFrontMatter(frontMatter)) {
    console.error(validateFrontMatter.errors)
    throw new Error(`invalid front matter: ${file}`)
  }
  const form = commonmark.parse(markup).form
  const dirname = path.dirname(file)
  const [_, publisher, project] = dirname.split(path.sep)
  const edition = frontMatter.edition
  return {
    publisher,
    project,
    edition,
    frontMatter,
    digest: hash(form),
    form,
  }
})

function getForm(repository, digest, callback) {
  if (repository !== 'commonform.org')
    return callback(
      new Error(`invalid repository: ${repository}`),
    )
  const result = forms.find((element) => {
    return element.digest === digest
  })
  callback(null, result ? result.form : false)
}

function getPublication(
  repository,
  publisher,
  project,
  edition,
  callback,
) {
  if (repository !== 'commonform.org')
    return callback(
      new Error(`invalid repository: ${repository}`),
    )
  const publication = forms.find((element) => {
    return (
      element.publisher === publisher &&
      element.project === project &&
      element.edition === edition
    )
  })
  const result = publication
    ? { digest: publication.digest }
    : false
  callback(null, result)
}

function getEditions(repository, publisher, project, callback) {
  if (repository !== 'commonform.org')
    return callback(
      new Error(`invalid repository: ${repository}`),
    )
  const editions = forms
    .filter((element) => {
      return (
        element.publisher === publisher &&
        element.project === project
      )
    })
    .map((element) => element.edition)
  const result = editions.length > 0 ? editions : false
  callback(null, result)
}

const loadOptions = {
  repositories: ['commonform.org'],
  caches: {
    editions: { get: getEditions },
    publications: { get: getPublication },
    forms: { get: getForm },
  },
}

runSeries(
  formFiles.map((file) => {
    return (done) => {
      const contents = fs.readFileSync(file, 'utf8')
      const parsed = grayMatter(contents)
      const markup = parsed.content
      const frontMatter = parsed.data
      if (!validateFrontMatter(frontMatter)) {
        console.error(validateFrontMatter.errors)
        throw new Error(`invalid front matter: ${file}`)
      }
      const form = commonmark.parse(markup).form
      loadComponents(
        form,
        loadOptions,
        (error, loaded, resolutions) => {
          if (error) throw error
          const rendered = toHTML(loaded, [], {
            html5: true,
            lists: true,
            ids: true,
          })
          const dirname = path.dirname(file)
          const [_, publisher, project] = dirname.split(path.sep)
          const edition = frontMatter.edition
          const title = frontMatter.title || project
          const data = Object.assign(
            {
              title,
              github: `https://github.com/commonform/commonform-static/blob/master/${file}`,
              digest: hash(form),
              docx: `${edition}.docx`,
              json: `${edition}.json`,
              markdown: `${edition}.md`,
              spelled: revedSpell(edition),
              project,
              publisher,
              rendered,
            },
            frontMatter,
          )
          const html = ejs.render(templates.form, data)
          const page = path.join(
            'site',
            publisher,
            project,
            `${edition}.html`,
          )
          fs.mkdirSync(path.dirname(page), { recursive: true })
          fs.writeFileSync(page, html)
          if (!publishers[publisher]) {
            publishers[publisher] = {
              publisher,
              projects: {},
            }
          }
          if (!publishers[publisher].projects[project]) {
            publishers[publisher].projects[project] = {}
          }
          publishers[publisher].projects[project][
            edition
          ] = frontMatter
          docx(loaded, [], {
            title,
            edition,
            centerTitle: false,
            indentMargins: true,
            markFilled: true,
            numbering:
              numberings[frontMatter.numbering || 'outline'],
            after: frontMatter.signaturePages
              ? ooxmlSignaturePages(frontMatter.signaturePages)
              : false,
            styles: frontMatter.styles || {
              alignment: 'left',
              heading: {
                italic: true,
              },
              reference: {
                italic: true,
              },
              referenceHeading: {
                italic: true,
              },
            },
          })
            .generateAsync({ type: 'nodebuffer' })
            .then((buffer) => {
              const wordFile = path.join(
                'site',
                publisher,
                project,
                `${edition}.docx`,
              )
              fs.writeFileSync(wordFile, buffer)
            })

          const jsonFile = path.join(
            'site',
            publisher,
            project,
            `${edition}.json`,
          )
          fs.writeFileSync(
            jsonFile,
            JSON.stringify({ frontMatter, form }),
          )

          const markdownFile = path.join(
            'site',
            publisher,
            project,
            `${edition}.md`,
          )
          fs.writeFileSync(markdownFile, markup)
          done()
        },
      )
    }
  }),
  () => {
    renderPublisherPages()
    renderHomePage()
  },
)

function renderPublisherPages() {
  Object.keys(publishers).forEach((publisher) => {
    const projects = publishers[publisher].projects

    renderPublisherPage()
    renderProjectsPages()

    function renderPublisherPage() {
      const publisherPage = path.join(
        'site',
        publisher,
        'index.html',
      )
      const data = Object.assign({}, publishers[publisher])
      const html = ejs.render(templates.publisher, data)
      fs.writeFileSync(publisherPage, html)
    }

    function renderProjectsPages() {
      Object.keys(projects).forEach((project) => {
        const projectPage = path.join(
          'site',
          publisher,
          project,
          'index.html',
        )
        const editions = Object.keys(projects[project])
          .map((edition) => {
            const frontMatter = projects[project][edition]
            return {
              number: edition,
              spelled: revedSpell(edition),
              frontMatter,
            }
          })
          .sort((a, b) => {
            return revedCompare(a.edition, b.edition)
          })
        const data = {
          publisher,
          project,
          editions,
        }
        const html = ejs.render(templates.project, data)
        fs.writeFileSync(projectPage, html)
      })
    }
  })
}

function renderHomePage() {
  const page = path.join('site', 'index.html')
  const data = {
    publishers: Object.keys(publishers),
  }
  const html = ejs.render(templates.home, data)
  fs.writeFileSync(page, html)
}

glob.sync('static/*').forEach((file) => {
  const basename = path.basename(file)
  fs.copyFileSync(file, path.join('site', basename))
})
