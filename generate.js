#!/usr/bin/env node
const AJV = require('ajv')
const commonmark = require('commonmark')
const docx = require('commonform-docx')
const ejs = require('ejs')
const englishMonths = require('english-months')
const fs = require('fs')
const glob = require('glob')
const grayMatter = require('gray-matter')
const hash = require('commonform-hash')
const loadComponents = require('commonform-load-components')
const markup = require('commonform-commonmark')
const ooxmlSignaturePages = require('ooxml-signature-pages')
const path = require('path')
const revedCompare = require('reviewers-edition-compare')
const revedParse = require('reviewers-edition-parse')
const revedSpell = require('reviewers-edition-spell')
const rimraf = require('rimraf')
const runSeries = require('run-series')
const semver = require('semver')
const toHTML = require('commonform-html')

const numberings = {
  decimal: require('decimal-numbering'),
  outline: require('outline-numbering'),
  rse: require('resolutions-schedules-exhibits-numbering'),
  ase: require('agreement-schedules-exhibits-numbering'),
}

const ajv = new AJV()
const validateFrontMatter = ajv.compile(
  require('./schemas/front-matter'),
)
const validateProject = ajv.compile(require('./schemas/project'))
const validatePublisher = ajv.compile(
  require('./schemas/publisher'),
)

rimraf.sync('site')

fs.mkdirSync('site', { recursive: true })

const templates = {}
glob.sync('templates/*.ejs').forEach((file) => {
  const basename = path.basename(file, '.ejs')
  templates[basename] = fs.readFileSync(file, 'utf8')
})

const publishers = {}

const markdownFiles = glob.sync('forms/*/*/*.md')
const formFiles = markdownFiles.filter((file) => {
  return path.basename(file) !== 'index.md'
})
const indexFiles = markdownFiles.filter((file) => {
  return path.basename(file) === 'index.md'
})

const forms = formFiles.map((file) => {
  const contents = fs.readFileSync(file, 'utf8')
  const parsed = grayMatter(contents)
  const content = parsed.content
  const frontMatter = parsed.data
  if (!validateFrontMatter(frontMatter)) {
    console.error(validateFrontMatter.errors)
    throw new Error(`invalid front matter: ${file}`)
  }
  let form
  try {
    form = markup.parse(content).form
  } catch (error) {
    throw new Error(`invalid markup: ${file}`)
  }
  const dirname = path.dirname(file)
  const [_, publisher, project] = dirname.split(path.sep)
  const number = path.basename(file, '.md')
  return {
    publisher,
    project,
    number,
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
  number,
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
      element.number === number
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
    .map((element) => element.number)
    .filter((number) => isRevEd(number))
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

const projectMetadata = {}

indexFiles.forEach((projectFile) => {
  const contents = fs.readFileSync(projectFile)
  const parsed = grayMatter(contents)
  const meta = parsed.data
  meta.description = markdown(parsed.content)
  if (!validateProject(meta)) {
    console.error(validateProject.errors)
    throw new Error(`invalid project meta: ${projectFile}`)
  }
  const [_, publisher, project] = projectFile
    .replace('.json', '')
    .split(path.sep)
  if (!projectMetadata[publisher]) {
    projectMetadata[publisher] = {}
  }
  projectMetadata[publisher][project] = meta
})

const publisherFiles = glob.sync('forms/*/index.md')

const publisherMetadata = {}

publisherFiles.forEach((file) => {
  const contents = fs.readFileSync(file)
  const parsed = grayMatter(contents)
  const meta = parsed.data
  meta.about = markdown(parsed.content)
  if (!validatePublisher(meta)) {
    console.error(validatePublisher.errors)
    throw new Error(`invalid publisher meta: ${file}`)
  }
  const [_, publisher] = path.dirname(file).split(path.sep)
  if (!publisherMetadata[publisher]) {
    publisherMetadata[publisher] = meta
  }
})

runSeries(
  formFiles.map((file) => {
    return (done) => {
      const contents = fs.readFileSync(file, 'utf8')
      const parsed = grayMatter(contents)
      const content = parsed.content
      const frontMatter = parsed.data
      if (!validateFrontMatter(frontMatter)) {
        console.error(validateFrontMatter.errors)
        throw new Error(`invalid front matter: ${file}`)
      }
      const form = markup.parse(content).form
      loadComponents(
        clone(form),
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
          const number = path.basename(file, '.md')
          const title = frontMatter.title || project
          const data = Object.assign(
            {
              title,
              github: `https://github.com/commonform/commonform.org/blob/master/${file}`,
              digest: hash(form),
              docx: `${number}.docx`,
              json: `${number}.json`,
              markdown: `${number}.md`,
              spelled: spellNumber(number),
              project,
              projectMetadata:
                projectMetadata[publisher][project],
              notes: false,
              license: false,
              publisher,
              publisherMetadata: publisherMetadata[publisher],
              publishedDisplay: displayDate(
                frontMatter.published,
              ),
              rendered,
              number,
            },
            frontMatter,
          )
          let html
          try {
            html = ejs.render(templates.form, data)
          } catch (error) {
            throw new Error(`${file}: ${error.message}`)
          }
          const page = path.join(
            'site',
            publisher,
            project,
            `${number}.html`,
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
            publishers[publisher].projects[
              project
            ] = Object.assign(
              {
                numbers: {},
              },
              projectMetadata[publisher][project],
            )
          }
          publishers[publisher].projects[project].numbers[
            number
          ] = frontMatter
          docx(loaded, [], {
            title,
            number,
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
                `${number}.docx`,
              )
              fs.writeFileSync(wordFile, buffer)
            })

          const jsonFile = path.join(
            'site',
            publisher,
            project,
            `${number}.json`,
          )
          fs.writeFileSync(
            jsonFile,
            JSON.stringify(
              Object.assign({}, frontMatter, { form }),
            ),
          )

          const markdownFile = path.join(
            'site',
            publisher,
            project,
            `${number}.md`,
          )
          fs.writeFileSync(markdownFile, content)
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
      const projectsArray = Object.keys(projects).map((key) =>
        Object.assign({ name: key }, projects[key]),
      )
      const data = Object.assign(
        {
          email: false,
          website: false,
          location: false,
          name: false,
          trademarks: false,
          components: projectsArray.filter((project) => {
            return !project.archived && project.component
          }),
          completeForms: projectsArray.filter((project) => {
            return !project.archived && !project.component
          }),
          archived: projectsArray.filter((project) => {
            return project.archived
          }),
        },
        publisherMetadata[publisher],
        publishers[publisher],
      )
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
        const numbers = Object.keys(projects[project].numbers)
          .map((number) => {
            const frontMatter = projects[project].numbers[number]
            return {
              number: number,
              spelled: spellNumber(number),
              published: displayDate(frontMatter.published),
              frontMatter,
            }
          })
          .sort((a, b) => {
            return compareNumber(a.number, b.number)
          })
        const data = Object.assign(
          {
            publisher,
            project,
            numbers,
            trademarks: false,
            archived: false,
            website: false,
          },
          projectMetadata[publisher][project],
        )
        const html = ejs.render(templates.project, data)
        fs.writeFileSync(projectPage, html)
      })
    }
  })
}

function renderHomePage() {
  const page = path.join('site', 'index.html')
  const data = {
    publishers: Object.keys(publishers)
      .map((publisher) => {
        return Object.assign(
          { id: publisher },
          publisherMetadata[publisher],
        )
      })
      .sort((a, b) => a.id.localeCompare(b.id)),
  }
  const html = ejs.render(templates.home, data)
  fs.writeFileSync(page, html)
}

glob.sync('static/*').forEach((file) => {
  const basename = path.basename(file)
  fs.copyFileSync(file, path.join('site', basename))
})

function clone(x) {
  return JSON.parse(JSON.stringify(x))
}

function markdown(markup) {
  const reader = new commonmark.Parser()
  const writer = new commonmark.HtmlRenderer({ safe: true })
  const parsed = reader.parse(markup)
  return writer.render(parsed)
}

function displayDate(string) {
  const date = new Date(string)
  return (
    englishMonths[date.getMonth()] +
    ' ' +
    date.getDate() +
    ', ' +
    date.getFullYear()
  )
}

function isRevEd(string) {
  return !!revedParse(string)
}

function spellNumber(string) {
  return isRevEd(string) ? revedSpell(string) : string
}

function compareNumber(a, b) {
  var aIsRevEd = isRevEd(a)
  var bIsRevEd = isRevEd(b)
  if (aIsRevEd && !bIsRevEd) {
    return -1
  } else if (!aIsRevEd && bIsRevEd) {
    return 1
  } else if (aIsRevEd && bIsRevEd) {
    return revedCompare(a, b)
  } else {
    return semver.compare(a, b)
  }
}
