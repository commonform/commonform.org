document.addEventListener('click', function (event) {
  var target = event.target
  if (target.className.indexOf('commentButton') === -1) return
  var sibling = target.nextElementSibling
  window.requestAnimationFrame(function () {
    sibling.className = sibling.className.replace('hidden', '')
    target.className = target.className + ' hidden'
  })
})
