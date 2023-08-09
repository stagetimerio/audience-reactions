const { version } = require('./package.json')
const { exec } = require('child_process')

exec(`npm --no-git-tag-version version ${version} --prefix client`)
