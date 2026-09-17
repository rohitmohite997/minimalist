import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import AuthPage from './AuthPage';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('AuthPage', () => {
  let container;
  let root;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    useAuth.mockReturnValue({
      user: false,
      loading: false,
      login: jest.fn().mockResolvedValue({ success: true }),
      register: jest.fn().mockResolvedValue({ success: true }),
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    jest.clearAllMocks();
  });

  it('loads remembered credentials when saved', () => {
    localStorage.setItem(
      'mini_malist_saved_login',
      JSON.stringify({ email: 'saved@example.com', password: 'secret123', remember: true })
    );

    act(() => {
      root.render(<AuthPage />);
    });

    const emailInput = container.querySelector('[data-testid="email-input"]');
    const passwordInput = container.querySelector('[data-testid="password-input"]');

    expect(emailInput.value).toBe('saved@example.com');
    expect(passwordInput.value).toBe('secret123');
  });
});
