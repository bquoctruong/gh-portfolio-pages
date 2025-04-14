// CommonJS version of the setup file

// Set up global mocks that will be available to all test files
global.setupMocks = () => {
  if (typeof jest !== 'undefined') {
    jest.resetModules();
  }
  
  // Mock process.env before importing any modules
  process.env.LAMBDA_TASK_ROOT = undefined;
  process.env.NODE_ENV = 'test';
};

// Ensure jest is available globally
global.jest = global.jest || require('jest-mock');

// Clean up after each test
afterEach(() => {
  if (typeof jest !== 'undefined') {
    jest.clearAllMocks();
  }
}); 