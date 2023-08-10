const Background = {
  OCEANIC: 'bg-gradient-to-tl from-green-300 via-blue-500 to-purple-600',
  HYPER: 'bg-gradient-to-tl from-pink-500 via-red-500 to-yellow-500',
  // GOTHAM: 'bg-gradient-to-tl from-gray-700 via-gray-900 to-black',
  MIDNIGHT: 'bg-gradient-to-r from-blue-700 via-blue-800 to-gray-900',
  BEACHSIDE: 'bg-gradient-to-tl from-yellow-200 via-green-200 to-green-500',
  // EMERALD: 'bg-gradient-to-tl from-emerald-500 to-lime-600',
  LUST: 'bg-gradient-to-r from-rose-700 to-pink-600',
  BLACK: 'bg-black',
  TRANSPARENT: 'bg-transparent',
  GREENSCREEN: 'bg-[#00b140]',
}

function keyToValue (key) {
  if (!key) return
  return Background[key]
}

function valueToKey (value) {
  for (const [key, val] of Object.entries(Background)) {
    if (val === value) return key
  }
}

export default {
  ...Background,
  keys: Object.keys(Background),
  values: Object.values(Background),
  keyToValue,
  valueToKey,
}
