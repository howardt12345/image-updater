const {alias} = require('react-app-rewire-alias')

module.exports = function override(config) {

  alias({
    '@api': 'src/api',
    '@components': 'src/components',
    '@firebase-api': 'src/firebase',
    '@fonts': 'src/fonts',
    '@pages': 'src/pages',
    '@routes': 'src/routes',
    '@styles': 'src/styles',
    '@utils': 'src/utils',
    '@vars': 'src/vars',
  })(config)

  return config
}