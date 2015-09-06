function resizeTextarea(textarea) {
  var overflow = 0
  if (window.getComputedStyle) {
    var styles = window.getComputedStyle(textarea)
    var value = function(key) {
      return styles.getPropertyValue(key) }
    var boxSizing = (
      value('box-sizing') === 'border-box' ||
      value('-moz-box-sizing') === 'border-box' ||
      value('-webkit-box-sizing') === 'border-box' )
    overflow = (
      boxSizing ?
        0 :
        ( parseInt(value('padding-bottom') || 0, 10) +
          parseInt(value('padding-top') || 0, 10) ) ) }
  textarea.style.height = 'auto'
  textarea.style.height = ( textarea.scrollHeight - overflow ) + 'px' }

module.exports = resizeTextarea
