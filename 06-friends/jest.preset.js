const nxPreset = require('@nx/jest/preset').default;
const mongoPreset = require('@shelf/jest-mongodb/jest-preset')

module.exports = {
  ...nxPreset,
  ...mongoPreset,
  bail: false,
  coverageReporters: ['clover', 'json', 'text', 'lcov', 'text-summary', 'html'],
  setupFiles: ['reflect-metadata'],
  transformIgnorePatterns: ['node_modules/(?!(file-type)/)'],
}
