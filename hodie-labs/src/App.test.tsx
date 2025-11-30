import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock Auth0 for testing
jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }: any) => children,
  useAuth0: () => ({
    isLoading: false,
    isAuthenticated: false,
    loginWithRedirect: jest.fn(),
  }),
}));

test('renders HodieLabs application', () => {
  render(<App />);
  // Test that the app renders without crashing
  expect(document.body).toBeInTheDocument();
});
