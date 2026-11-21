import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: mocks.onAuthStateChanged,
  signOut: mocks.signOut,
}));
vi.mock('../firebase', () => ({ auth: {} }));

import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';

function Consumer() {
  const { user, loading, logout } = useAuth();
  return (
    <div>
      <span>{loading ? 'Loading' : user?.email || 'No user'}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates auth state and unsubscribes on unmount', async () => {
    let authCallback;
    const unsubscribe = vi.fn();
    mocks.onAuthStateChanged.mockImplementation((_auth, callback) => {
      authCallback = callback;
      callback(null);
      return unsubscribe;
    });

    const { unmount } = render(<AuthProvider><Consumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByText('No user')).toBeInTheDocument());
    authCallback({ email: 'user@example.com' });
    expect(await screen.findByText('user@example.com')).toBeInTheDocument();
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('calls Firebase signOut', () => {
    mocks.onAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(null);
      return vi.fn();
    });
    mocks.signOut.mockResolvedValueOnce();
    render(<AuthProvider><Consumer /></AuthProvider>);
    screen.getByRole('button', { name: 'Logout' }).click();
    expect(mocks.signOut).toHaveBeenCalledWith({});
  });
});
