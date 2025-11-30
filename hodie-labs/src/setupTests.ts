// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock TextEncoder/TextDecoder for Jest environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock crypto for testing
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: (arr: any) => arr,
    subtle: {
      generateKey: jest.fn(),
      importKey: jest.fn(),
      deriveKey: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      digest: jest.fn(),
      exportKey: jest.fn(),
    }
  }
});

// Mock Firebase
jest.mock('./firebase/config', () => ({
  auth: {},
  db: {},
}));
