export default {
  transform: {},
  extensionsToTreatAsEsm: ['.js', '.mjs'],
  moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.mjs'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  clearMocks: true
};