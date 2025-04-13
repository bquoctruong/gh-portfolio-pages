import { jest } from '@jest/globals';

// Set up global mocks that will be available to all test files
globalThis.setupMocks = () => {
  jest.resetModules();
  
  // Mock process.env before importing any modules
  process.env.LAMBDA_TASK_ROOT = undefined;
  process.env.NODE_ENV = 'test';
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 