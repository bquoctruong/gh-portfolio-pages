/** @type {import('jest').Config} */
module.exports = {
  // Basic configuration
  testEnvironment: 'node',
  
  // Only test the specific test file
  testMatch: ['**/tests/index.test.js'],
  
  // Define transform settings
  transform: {},
  
  // Ensure CommonJS modules are properly handled
  moduleFileExtensions: ['js', 'cjs', 'mjs', 'json', 'node'],
  
  // Clear mock calls between tests
  clearMocks: true,
  
  // Setup files
  setupFilesAfterEnv: ['./tests/jest-setup.js'],
  
  // Timeout for tests
  testTimeout: 10000,
  
  // Environment variables
  testEnvironmentOptions: {
    env: {
      NODE_ENV: 'test'
    }
  },
  
  // Generate coverage report for the bridge file only
  collectCoverage: true,
  collectCoverageFrom: ['src/index.cjs'],
  coverageReporters: ['json', 'lcov', 'text', 'clover']
}; 