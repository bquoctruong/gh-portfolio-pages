export default {
  transform: {},
  moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testEnvironment: 'node',
  //testMatch: ['**/tests/**/*.test.js'],
  testMatch: ['**/tests/**/*.test.mjs'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
  injectGlobals: true,
  extensionsToTreatAsEsm: ['.mjs'],
  setupFilesAfterEnv: ['./tests/setup.mjs']
};