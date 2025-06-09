/** @type {import('jest').Config} */
export default {
  // Test environment
  testEnvironment: 'node',

  // ESM support
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],

  // Module transformation
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: './tsconfig.test.json',
      },
    ],
  },

  // Module name mapping (for path aliases)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^~/(.*)$': '<rootDir>/$1',
  },

  // File extensions to recognize
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Test file patterns
  testMatch: ['**/__tests__/**/*.(ts|tsx|js|jsx)', '**/*.(test|spec).(ts|tsx|js|jsx)'],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts', '!src/**/__tests__/**', '!src/**/*.test.*', '!src/**/*.spec.*'],

  // Coverage thresholds (adjust as needed)
  coverageThreshold: {
    global: {
      branches: 35,
      functions: 35,
      lines: 40,
      statements: 40,
    },
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Clear mocks between tests
  clearMocks: true,

  // Automatically restore mock state between every test
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],

  // Transform ignore patterns (allow transforming specific node_modules if needed)
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],
};
