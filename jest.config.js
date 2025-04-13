export default {
  transform: {},
  moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
  injectGlobals: true,
  setupFilesAfterEnv: ['./tests/setup.mjs']
};