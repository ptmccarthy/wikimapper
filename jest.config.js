module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json'],
  roots: ['<rootDir>'],
  testMatch: [
    '<rootDir>/test/**/*.spec.js',
    '<rootDir>/test/**/*.test.js'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleNameMapper: {
    '^webextension-polyfill$': '<rootDir>/test/mocks/browser-polyfill.js'
  },
  setupFiles: ['<rootDir>/test/mocks/setup.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text'],
  verbose: true,
  testPathIgnorePatterns: ['/node_modules/']
}; 