// Set up the Jest environment for testing with the bridge pattern

// Ensure Jest is available globally
global.jest = global.jest || require('jest-mock');

// Set NODE_ENV to test to enable test mode in the bridge
process.env.NODE_ENV = 'test';

// Mock necessary dependencies
jest.mock('fs'); // For filesystem operations
jest.mock('child_process'); // For any child process operations

// Clean up between tests
beforeEach(() => {
  jest.clearAllMocks();
}); 