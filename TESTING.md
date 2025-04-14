# Testing Guide for gh-portfolio-pages

This document explains the testing setup for this project, which uses a bridge pattern to test ES Modules with CommonJS Jest tests.

## Testing Architecture

This project uses:
- **ES Modules** for the main application code (`src/index.js`)
- **CommonJS** for the test bridge (`src/index.cjs`)
- **Jest** for running tests (`tests/index.test.js`)

### Bridge Pattern

To address the challenge of testing ES Modules with Jest (which works better with CommonJS), this project uses a "bridge pattern":

1. The main code is written in ES Modules format in `src/index.js`
2. A CommonJS bridge file (`src/index.cjs`) provides implementations of the same functions
3. Tests import from the bridge file, which provides equivalent functionality to the real implementation

This approach allows us to:
- Keep the main codebase in modern ES Module format
- Run tests using Jest's standard testing capabilities
- Avoid complex build/transpilation setups

## Running Tests

### Standard Tests (via Bridge)

```bash
npm test
```

This runs the Jest tests using the bridge implementation. This is suitable for most CI/CD and local development scenarios.

### ESM-Native Tests

```bash
npm run test:esm
```

This runs tests directly against the ES Module code using Node's experimental VM modules support.

## How It Works

1. The bridge file (`src/index.cjs`) implements the same functions as the main ES Module
2. Jest tests import these functions from the bridge
3. The bridge detects if it's running in test mode via `NODE_ENV=test`
4. For tests, it provides implementations that can be easily mocked and tested

## Files Overview

- `src/index.js` - The main ES Module implementation
- `src/index.cjs` - The CommonJS bridge that mirrors the functionality
- `tests/index.test.js` - Tests that use the bridge
- `tests/index.test.mjs` - ESM-native tests (alternative approach)
- `tests/jest-setup.js` - Sets up mocks for fs and other dependencies
- `jest.config.cjs` - Jest configuration

### Removed Files

The project previously used a separate mock module approach with `tests/mockModule.js`, which has been removed in favor of the more maintainable bridge pattern.

## GitHub Actions Integration

The GitHub workflow is configured to run tests using the bridge approach with:

```yaml
run: node --no-warnings ./node_modules/jest/bin/jest.js --config=jest.config.cjs ./tests/index.test.js
env:
  NODE_ENV: test
  CI: true
```

## Coverage Reports

Jest is configured to generate coverage reports for the bridge file. This gives a good indication of test coverage, although it doesn't directly measure coverage of the ES Module code.

## Future Improvements

To fully validate both the CommonJS bridge and the ES Module implementation:

1. Add more comprehensive integration tests that run the actual server
2. Develop a mechanism to ensure the bridge implementations stay in sync with the ES Module code
3. Consider using a transpilation approach for full ESM testing support when Jest's ESM support is more mature 