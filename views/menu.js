var clone = require('../utilities/clone')
var digestLink = require('./digest-link')
var docx = require('commonform-docx')
var filesaver = require('filesaver.js').saveAs
var html = require('yo-yo')
var outline = require('outline-numbering')
var parseMarkup = require('commonform-markup-parse')
var querystring = require('querystring')
var signaturePagesToOOXML = require('ooxml-signature-pages')
var toMarkup = require('commonform-markup-stringify')

module.exports = function (form, send) {
  return html`
    <div class="menu">
      <h2>Download, Open, and E-Mail</h2>
      <p>
        <button onclick=${downloadDOCX}>Download for Word</button>
        <button onclick=${downloadMarkup}>Download Markup</button>
        <button onclick=${email}>E-Mail</button>
        <form class=fileInputTrick>
          <button>Open File</button>
          <input
              type=file
              accept=".cform,.commonform,.json"
              onchange=${selectFile}></input>
        </form>
      </p>

      <h2>Donate Anonymously to commonform.org</h2>
      <form onsubmit=${donateForm}>
        <p>
          <input
              type=text
              required
              placeholder="Publisher Name"
              name=publisher></input>
          <input
              type=password
              required
              placeholder="Password"
              name=password></input>
          <button type=submit>Donate Form</button>
        </p>
      </form>
      <p>
        <em>
          Make damn sure there isn’t any confidential information
          in the form first.  Deal-specific details like price,
          due dates, party names, and product descriptions should be
          made fill-in-the-blanks.  Replace any defined terms based
          on real party names with more generic terms.  If parts of
          a form are unavoidably confidential, consider sharing just
          the more generic parts.
        </em>
      </p>
      <p>
        Donate a form to commonform.org to make it available to anyone
        who requests a copy by its fingerprint. The fingerprint of
        this form is:
      </p>
      <p>
        ${digestLink(form.merkle.digest, send)}
      </p>
      <p>
        Donated forms are not indexed for search or included in any
        public list.  Others who ask for the form by fingerprint can
        determine if someone has already donated it, and what it says,
        but not who donated it.  (Your publisher name and password
        are not associated with the form.)  Other publishers who find
        the form may choose to publish it under their names.
      </p>
      <p>
        Answers to fill-in-the-blanks you have completed will
        <em>not</em> be donated along with the content of the form.
        The fact that a computer with the IP address you use donated
        the form will appear in commonform.org’s log files for
        a short time.  These log files are periodically cleared.
        Log files are <em>not</em> published.
      </p>
      <p>
        Anonymous donations cannot be rescinded.  There is no reliable
        way to tell whether you donated a form, or whether someone
        else might have donated the same form.  Others may be relying
        on its availability here.
      </p>

      <h2>Publish to commonform.org</h2>
      <form onsubmit=${publishForm}>
        <p>
          <input
              type=text
              required
              placeholder="Publisher Name"
              name=publisher></input>
          <input
              type=password
              required
              placeholder="Password"
              name=password></input>
        </p>
        <p>
          <input
              type=text
              required
              placeholder="Project Name"
              name=project></input>
          <input
              type=text
              required
              placeholder="Reviewers Edition"
              name=edition></input>
          <button type=submit>Publish Form</button>
        </p>
      </form>
      <p>
        <em>
          “Publish Form” is the most powerful button
          on this website.  With awesome power comes awesome
          don’t-blow-your-head-off responsibility.  Read your form
          again and make sure you're willing to associate yourself
          with it indefinitely.
        </em>
      </p>
      <p>
        Publishing a form to commonform.org means:
      </p>
      <ol>
        <li>
          anonymously donating the form to commonform.org
        </li>
        <li>
          listing a link to the form as a project under your name
        </li>
        <li>
          making it available to anyone who asks for it by project
          name and edition
        </li>
        <li>
          showing everyone who browses to the form the fact that you
          published it
        </li>
        <li>
          allowing commonform.org to index your form
        </li>
      </ol>
      <p>
        Publications cannot be rescinded.  To correct an error or
        make an improvement, publish another form under the same
        project name with a later
        <a href="https://www.npmjs.com/package/reviewers-edition-parse"
          >Reviewers Edition</a>.
      </p>
    </div>
  `

  function downloadDOCX (event) {
    event.preventDefault()
    var title = window.prompt('Enter a document title', 'Untitled Form')
    if (title !== null) {
      var options = {title: title, numbering: outline}
      if (form.signatures) {
        options.after = signaturePagesToOOXML(form.signatures)
      }
      filesaver(
        docx(clone(form.tree), form.blanks, options)
        .generate({type: 'blob'}),
        fileName(title, 'docx')
      )
    }
  }

  function downloadMarkup (event) {
    event.preventDefault()
    var title = window.prompt('Enter a document title', 'Untitled Form')
    if (title !== null) {
      var blob = new window.Blob(
        [toMarkup(form.tree)],
        {type: 'text/plain;charset=utf-8'}
      )
      filesaver(blob, fileName(title, 'cform'))
    }
  }

  function selectFile (event) {
    event.preventDefault()
    var target = event.target
    var file = target.files[0]
    var reader = new window.FileReader()
    var isJSON = file.type.match(/application\/json/)
    reader.onload = function (event) {
      var result = event.target.result
      var tree
      try {
        tree = isJSON ? JSON.parse(result) : parseMarkup(result).form
      } catch (error) { return }
      send('form:loaded', tree)
    }
    reader.readAsText(file, 'UTF-8')
    target.value = null
  }

  function email (event) {
    event.preventDefault()
    window.location.href = 'mailto:?' + querystring.stringify({
      subject: 'Link to Common Form',
      body: 'https://commonform.org/forms/' + form.merkle.digest
    })
  }

  function donateForm (event) {
    event.preventDefault()
    event.stopPropagation()
    send('form:donate', fromElements(event.target.elements, [
      'publisher', 'password'
    ]))
  }

  function publishForm (event) {
    event.preventDefault()
    event.stopPropagation()
    send('form:publish', fromElements(event.target.elements, [
      'publisher', 'password', 'project', 'edition'
    ]))
  }

  function fromElements (elements, names) {
    var returned = {}
    names.forEach(function (name) {
      returned[name] = elements[name].value
      elements[name].value = ''
    })
    return returned
  }
}

function fileName (title, extension) {
  var date = new Date().toISOString()
  return '' + title + ' ' + date + '.' + extension
}
