/**
 * AuthScreen component tests
 *
 * Covers:
 *  - Login / Signup tab switching
 *  - Email + password validation (submit disabled when invalid)
 *  - Successful sign-in calls onAuth
 *  - Error display on failed sign-in
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthScreen } from '@/components/auth/AuthScreen';

// ---------------------------------------------------------------------------
// Mock Supabase auth helpers at the module level
// ---------------------------------------------------------------------------
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithGoogle = vi.fn().mockResolvedValue({ error: null });
const mockSignInWithApple = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/lib/supabase/auth', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signUp: (...args: unknown[]) => mockSignUp(...args),
  signInWithGoogle: () => mockSignInWithGoogle(),
  signInWithApple: () => mockSignInWithApple(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderAuthScreen(onAuth = vi.fn()) {
  return { ...render(<AuthScreen onAuth={onAuth} />), onAuth };
}

function fillLoginForm(email: string, password: string) {
  fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: password } });
}

/**
 * Returns the submit button (Sign In / Create Account) by looking for the button
 * whose onClick triggers handleSubmit. It has a specific class containing 'bg-lotus-600'.
 */
function getSubmitButton() {
  return screen
    .getAllByRole('button')
    .find((btn) => btn.className.includes('bg-lotus-600') || btn.className.includes('w-full flex items-center justify-center'));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('AuthScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the email input by default', () => {
    renderAuthScreen();
    expect(screen.getByPlaceholderText(/email/i)).toBeDefined();
  });

  it('switches to Sign Up mode when the Sign Up tab is clicked', () => {
    renderAuthScreen();
    const allButtons = screen.getAllByRole('button');
    // The Sign Up tab is the second of the two mode tabs
    const signUpTab = allButtons.find((b) => b.textContent?.trim() === 'Sign Up');
    if (signUpTab) fireEvent.click(signUpTab);
    // In signup mode a Name field should appear
    expect(screen.getByPlaceholderText(/name/i)).toBeDefined();
  });

  it('submit button is disabled when inputs are empty', () => {
    // Arrange
    renderAuthScreen();

    // Act — no input provided

    // Assert — the submit button has disabled=true
    const submitBtn = getSubmitButton();
    expect(submitBtn).toBeDefined();
    expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('submit button becomes enabled with valid credentials', () => {
    mockSignIn.mockResolvedValue({ user: null, error: 'bad creds' });
    renderAuthScreen();
    fillLoginForm('user@example.com', 'password123');
    const submitBtn = getSubmitButton();
    expect((submitBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('calls onAuth with the user on successful sign-in', async () => {
    // Arrange
    const fakeUser = { id: 'uid-1', email: 'user@example.com' };
    mockSignIn.mockResolvedValue({ user: fakeUser, error: null });
    const { onAuth } = renderAuthScreen();

    // Act
    fillLoginForm('user@example.com', 'password123');
    const submitBtn = getSubmitButton();
    fireEvent.click(submitBtn!);

    // Assert
    await waitFor(() => expect(onAuth).toHaveBeenCalledWith(fakeUser), { timeout: 3000 });
  });

  it('displays error message when sign-in fails', async () => {
    // Arrange
    mockSignIn.mockResolvedValue({ user: null, error: 'Invalid credentials' });
    renderAuthScreen();

    // Act
    fillLoginForm('user@example.com', 'wrongpassword');
    fireEvent.click(getSubmitButton()!);

    // Assert
    await waitFor(
      () => expect(screen.getByText('Invalid credentials')).toBeDefined(),
      { timeout: 3000 },
    );
  });

  it('clears error when switching between login and signup modes', async () => {
    // Arrange
    mockSignIn.mockResolvedValue({ user: null, error: 'Invalid credentials' });
    renderAuthScreen();
    fillLoginForm('user@example.com', 'wrongpassword');
    fireEvent.click(getSubmitButton()!);
    await waitFor(() => screen.getByText('Invalid credentials'), { timeout: 3000 });

    // Act — switch to Sign Up
    const allButtons = screen.getAllByRole('button');
    const signUpTab = allButtons.find((b) => b.textContent?.trim() === 'Sign Up');
    fireEvent.click(signUpTab!);

    // Assert
    expect(screen.queryByText('Invalid credentials')).toBeNull();
  });
});
