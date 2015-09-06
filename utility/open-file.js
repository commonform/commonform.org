function openFile(callback) {
  if (
    window.File && window.FileReader &&
    window.FileList && window.Blob )
  { var input = document.createElement('input')
    input.type = 'file'
    input.addEventListener('change', function(event) {
      var file = event.target.files[0]
      var reader = new FileReader()
      reader.addEventListener('load', function(event) {
        callback(event.target.result) })
      reader.readAsText(file, 'ascii') })
    var event = document.createEvent('MouseEvents')
    event.initEvent('click', true, true)
    input.dispatchEvent(event) }
  else {
    window.alert('Your web browser does not support reading files') } }

module.exports = openFile
