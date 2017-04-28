module.exports = function findLocalLinkAnchor (node) {
  if (!node) {
    return undefined
  } else {
    var checkParent = (
      !node ||
      node.localName !== 'a' ||
      node.href === undefined ||
      window.location.host !== node.host
    )
    return checkParent ? findLocalLinkAnchor(node.parentNode) : node
  }
}
