import backgrounds from './backgrounds.js'

export function getParam (key) {
  const url = new URL(window.location)
  const value = url.searchParams.get(key)
  if (value === '1') return true
  else if (value === undefined) return false
  else return value
}

export function setParam (key, value) {
  const url = new URL(window.location)
  if (value === true) url.searchParams.set(key, '1')
  else if (value === false) url.searchParams.delete(key)
  else url.searchParams.set(key, value)
  window.history.replaceState(null, null, url)
}

export const params = {
  get background () {
    return backgrounds.keyToValue(getParam('background')) || backgrounds.OCEANIC
  },
  set background (val) {
    setParam('background', backgrounds.valueToKey(val))
  },
  get hideButtons () {
    return getParam('hide-buttons')
  },
  set hideButtons (val) {
    setParam('hide-buttons', val)
  },
  get hideUi () {
    return getParam('hide-ui')
  },
  get stats () {
    return getParam('stats')
  },
}
