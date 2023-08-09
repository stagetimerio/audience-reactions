export function getParam (key) {
  const url = new URL(window.location)
  return url.searchParams.get(key)
}

export function setParam (key, value) {
  const url = new URL(window.location)
  url.searchParams.set(key, value)
  window.history.replaceState(null, null, url)
}
