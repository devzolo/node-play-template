// Jest setup file for global test configuration
import { jest, beforeEach, afterEach } from '@jest/globals';

// Extend Jest matchers with custom matchers if needed
// import '@testing-library/jest-dom';

// Global test timeout (optional)
jest.setTimeout(10000);

// Global beforeEach hook (optional)
beforeEach(() => {
  // Reset any global state before each test
  jest.clearAllMocks();
});

// Global afterEach hook (optional)
afterEach(() => {
  // Cleanup after each test
});

// Console configuration for tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out known warnings/errors that are expected in tests
  const message = args[0];
  if (typeof message === 'string') {
    // Add patterns here to suppress specific console errors in tests
    const suppressPatterns = [
      // Example: 'Warning: ReactDOM.render is deprecated'
    ];

    if (suppressPatterns.some(pattern => message.includes(pattern))) {
      return;
    }
  }

  originalConsoleError.apply(console, args);
};
