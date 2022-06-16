#!/usr/bin/env node
const AJV = require('ajv')
const addFormatstoAJV = require('ajv-formats')
const analyze = require('commonform-analyze')
const commonmark = require('commonmark')
const critique = require('commonform-critique')
const ejs = require('ejs')
const englishMonths = require('english-months')
const fs = require('fs')
const glob = require('glob')
const grayMatter = require('gray-matter')
const hash = require('commonform-hash')
const lint = require('commonform-lint')
const loadComponents = require('commonform-load-components')
const markup = require('commonform-commonmark')
const ooxmlSignaturePages = require('ooxml-signature-pages')
const path = require('path')
const prepareBlanks = require('commonform-prepare-blanks')
const renderDOCX = require('commonform-docx')
const renderHTML = require('commonform-html')
const versionCompare = require('legal-versioning-compare')
const versionParse = require('legal-versioning-parse')
const rimraf = require('rimraf')
const runParallel = require('run-parallel')
const runSeries = require('run-series')

const numberings = {
  decimal: require('decimal-numbering'),
  outline: require('outline-numbering'),
  rse: require('resolutions-schedules-exhibits-numbering'),
  ase: require('agreement-schedules-exhibits-numbering'),
}

const ajv = new AJV()
addFormatstoAJV(ajv)
const validateFrontMatter = ajv.compile(
  require('./schemas/front-matter'),
)
const validateProject = ajv.compile(require('./schemas/project'))
const validatePublisher = ajv.compile(
  require('./schemas/publisher'),
)

process.on('uncaughtException', (error) => {
  console.error(error)
  process.exit(1)
})

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
    console.error(`invalid front matter: ${file}`)
    process.exit(1)
  }
  let form
  try {
    form = markup.parse(content).form
  } catch (error) {
    console.error(`invalid markup: ${file}`)
    process.exit(1)
  }
  const digest = hash(form)
  if (frontMatter.digest && frontMatter.digest !== digest) {
    console.error(
      `${file} form digest ${digest} does not match front matter ${frontMatter.digest}`,
    )
    process.exit(1)
  }
  const dirname = path.dirname(file)
  const [_, publisher, project] = dirname.split(path.sep)
  const version = path.basename(file, '.md')
  return {
    publisher,
    project,
    version,
    frontMatter,
    digest: hash(form),
    form,
  }
})

function getForm(
  repository,
  publisher,
  project,
  version,
  callback,
) {
  if (repository !== 'commonform.org')
    return callback(
      new Error(`invalid repository: ${repository}`),
    )
  const result = forms.find((element) => {
    return (
      element.publisher === publisher &&
      element.project === project &&
      element.version === version
    )
  })
  callback(null, result ? result.form : false)
}

function getVersions(repository, publisher, project, callback) {
  if (repository !== 'commonform.org')
    return callback(
      new Error(`invalid repository: ${repository}`),
    )
  const versions = forms
    .filter((element) => {
      return (
        element.publisher === publisher &&
        element.project === project
      )
    })
    .map((element) => element.version)
  const result = versions.length > 0 ? versions : false
  callback(null, result)
}

const loadOptions = {
  repositories: ['commonform.org'],
  caches: {
    versions: { get: getVersions },
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
    console.error(`invalid project meta: ${projectFile}`)
    process.exit(1)
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
    console.error(`invalid publisher meta: ${file}`)
    process.exit(1)
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
      const split = grayMatter(contents)
      const content = split.content
      const frontMatter = split.data
      if (!validateFrontMatter(frontMatter)) {
        console.error(validateFrontMatter.errors)
        console.error(`invalid front matter: ${file}`)
        process.exit(1)
      }
      const parsed = markup.parse(content)
      const form = parsed.form
      runParallel(
        {
          original: (done) => {
            const options = Object.assign(
              { original: true },
              loadOptions,
            )
            loadComponents(clone(form), options, done)
          },
        },
        (error, loaded) => {
          if (error) {
            console.error(error)
            process.exit(1)
          }
          const values = prepareBlanks(
            frontMatter.defaults || {},
            parsed.directions,
          )
          const rendered = renderHTML(clone(form), values, {
            html5: true,
            lists: true,
            ids: true,
            depth: 1,
            smartify: true,
            classNames: ['form'],
          })
          console.error(file)
          const dirname = path.dirname(file)
          const [_, publisher, project] = dirname.split(path.sep)
          const version = path.basename(file, '.md')
          const title = frontMatter.title || project
          const annotations = []
            .concat(lint(form))
            .concat(critique(form))
          var analysis = analyze(form)
          const spelled = `Version ${version}`
          const data = Object.assign(
            {
              title,
              github: `https://github.com/commonform/commonform.org/blob/main/${file}`,
              digest: hash(form),
              docx: `${version}.docx`,
              completeDOCX: `${version}-complete.docx`,
              json: `${version}.json`,
              markdown: `${version}.md`,
              originalMarkdown: `${version}-original.md`,
              spelled,
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
              version,
              draft: Boolean(versionParse(version).draft),
            },
            frontMatter,
          )

          let html
          try {
            html = ejs.render(templates.form, data)
          } catch (error) {
            console.error(`${file}: ${error.message}`)
            process.exit(1)
          }
          const page = path.join(
            'site',
            publisher,
            project,
            `${version}.html`,
          )
          fs.mkdirSync(path.dirname(page), { recursive: true })
          fs.writeFileSync(page, html)

          writeHTML(loaded.original, 'complete')

          function writeHTML(form, suffix) {
            data.rendered = renderHTML(clone(form), values, {
              html5: true,
              lists: true,
              ids: true,
              depth: 1,
              smartify: true,
              classNames: ['form'],
            })
            try {
              html = ejs.render(templates.form, data)
            } catch (error) {
              console.error(`${file}: ${error.message}`)
              process.exit(1)
            }
            const htmlFile = path.join(
              'site',
              publisher,
              project,
              `${version}-${suffix}.html`,
            )
            fs.mkdirSync(path.dirname(htmlFile), {
              recursive: true,
            })
            fs.writeFileSync(htmlFile, html)
          }

          data.rendered = renderHTML(
            clone(loaded.original),
            values,
            {
              html5: true,
              lists: true,
              ids: true,
              depth: 1,
              smartify: true,
              classNames: ['form'],
              annotations,
            },
          )
          try {
            html = ejs.render(templates.form, data)
          } catch (error) {
            console.error(`${file}: ${error.message}`)
            process.exit(1)
          }
          const annotated = path.join(
            'site',
            publisher,
            project,
            `${version}-annotated.html`,
          )
          fs.mkdirSync(path.dirname(annotated), {
            recursive: true,
          })
          fs.writeFileSync(annotated, html)

          if (!publishers[publisher]) {
            publishers[publisher] = {
              publisher,
              projects: {},
            }
          }
          if (!publishers[publisher].projects[project]) {
            publishers[publisher].projects[project] =
              Object.assign(
                {
                  versions: {},
                },
                projectMetadata[publisher][project],
              )
          }
          publishers[publisher].projects[project].versions[
            version
          ] = frontMatter
          var docxOptions = {
            title,
            version,
            centerTitle: false,
            leftAlignBody: true,
            indentMargins: true,
            markFilled: true,
            smartify: true,
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
          }

          writeDOCX(form, '')
          writeDOCX(loaded.original, '-complete', '')

          function writeDOCX(form, suffix, label) {
            label = label || ''
            const options = Object.assign({}, docxOptions, {
              version: spelled + ' ' + label,
            })
            renderDOCX(clone(form), values, options)
              .generateAsync({ type: 'nodebuffer' })
              .then((buffer) => {
                const wordFile = path.join(
                  'site',
                  publisher,
                  project,
                  `${version}${suffix}.docx`,
                )
                fs.writeFileSync(wordFile, buffer)
              })
          }

          const jsonFile = path.join(
            'site',
            publisher,
            project,
            `${version}.json`,
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
            `${version}.md`,
          )
          fs.writeFileSync(markdownFile, content)

          writeMarkdown(loaded.original, '-original')
          function writeMarkdown(form, suffix) {
            const markdownFile = path.join(
              'site',
              publisher,
              project,
              `${version}${suffix}.md`,
            )
            fs.writeFileSync(
              markdownFile,
              markup.stringify(form),
            )
          }

          done()
        },
      )
    }
  }),
  () => {
    renderPublisherPages()
    renderHomePage()
    renderAtomFeeds()
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
          logo: false,
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
        const versions = Object.keys(projects[project].versions)
          .map((version) => {
            const frontMatter =
              projects[project].versions[version]
            return {
              number: version,
              spelled: `Version ${version}`,
              published: displayDate(frontMatter.published),
              frontMatter,
            }
          })
          .sort((a, b) => {
            return versionCompare(b.number, a.number)
          })
        const data = Object.assign(
          {
            publisher,
            project,
            versions,
            trademarks: false,
            archived: false,
            logo: false,
            website: false,
          },
          projectMetadata[publisher][project],
        )
        const html = ejs.render(templates.project, data)
        fs.writeFileSync(projectPage, html)
        const json = JSON.stringify({
          publisher,
          project,
          versions: versions.map((version) => {
            return version.number
          }),
        })
        const jsonFile = path.join(
          'site',
          publisher,
          project,
          'index.json',
        )
        fs.writeFileSync(jsonFile, json)
      })
    }
  })
}

const external = require('./external')

function renderHomePage() {
  const page = path.join('site', 'index.html')
  const featured = external.filter((project) => project.featured)
  Object.keys(publishers).forEach((publisherName) => {
    const publisher = publishers[publisherName]
    const projects = publishers[publisherName].projects
    Object.keys(projects).forEach((projectName) => {
      const project = projects[projectName]
      const versions = project.versions
      const latest = Object.keys(versions)
        .sort((a, b) => versionCompare(a, b))
        .reverse()[0]
      const version = versions[latest]
      if (project.featured) {
        featured.push({
          publisher: publisherName,
          name: publisherMetadata[publisherName].name,
          project: projectName,
          description: project.description,
          version: latest,
          published: version.published,
          title: version.title,
          logo: project.logo || false,
        })
      }
    })
  })
  featured.sort((a, b) => b.published.localeCompare(a.published))
  const data = {
    featured,
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

function renderAtomFeeds() {
  Object.keys(publishers).forEach((publisher) => {
    const publisherMeta = publisherMetadata[publisher]
    const projects = publishers[publisher].projects
    const feed = path.join('site', publisher, 'feed.xml')
    const publisherPosts = []
    Object.keys(projects).forEach((project) => {
      const projectPosts = []
      const projectMeta = projects[project]
      const versions = projects[project].versions
      Object.keys(versions).forEach((version) => {
        const versionMeta = versions[version]
        const permalink = `https://commonform.org/${publisher}/${project}/${version}`
        const post = toPost({
          project,
          version,
          projectMeta,
          versionMeta,
          permalink,
        })
        publisherPosts.push(post)
        projectPosts.push(post)
        projectPosts.sort(revereseChronological)
        const xml = ejs.render(templates.feed, {
          title: `${
            publisherMeta.name || publisher
          }’s ${project}`,
          description: 'forms on commonform.org',
          link: `https://commonform.org/${publisher}/${project}`,
          href: `https://commonform.org/${publisher}/${project}/feed.xml`,
          posts: projectPosts,
        })
        const feed = path.join(
          'site',
          publisher,
          project,
          'feed.xml',
        )
        fs.writeFileSync(feed, xml)
      })
    })
    publisherPosts.sort(revereseChronological)
    const xml = ejs.render(templates.feed, {
      title: `${publisherMeta.name || publisher}’s Forms`,
      description: 'forms on commonform.org',
      link: `https://commonform.org/${publisher}`,
      href: `https://commonform.org/${publisher}/feed.xml`,
      posts: publisherPosts,
    })
    fs.writeFileSync(feed, xml)
  })
  function revereseChronological(a, b) {
    return b.date.localeCompare(a.date)
  }
}

function toPost({
  project,
  version,
  projectMeta,
  versionMeta,
  permalink,
}) {
  return {
    title: `${projectMeta.title || project} ${version}`,
    description: '',
    date: versionMeta.published,
    link: permalink,
    permalink,
  }
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

function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key)
}
