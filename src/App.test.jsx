import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: { user: null, loading: false } }));
vi.mock('./context/useAuth', () => ({ useAuth: () => mocks.auth }));
vi.mock('./pages/Login', () => ({ default: () => <div>Login Page</div> }));
vi.mock('./pages/Signup', () => ({ default: () => <div>Signup Page</div> }));
vi.mock('./pages/Home', () => ({ default: () => <div>Home Page</div> }));
vi.mock('./pages/MyBookings', () => ({ default: () => <div>Bookings Page</div> }));
vi.mock('./pages/Owner', () => ({ default: () => <div>Owner Page</div> }));

import App from './App';

describe('App routing', () => {
  it('shows the loading state', () => {
    mocks.auth.loading = true;
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByText('Loading BookMyCut...')).toBeInTheDocument();
  });

  it('renders public routes when signed out', () => {
    mocks.auth.loading = false;
    mocks.auth.user = null;
    const first = render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();

    first.unmount();
    render(<MemoryRouter initialEntries={['/signup']}><App /></MemoryRouter>);
    expect(screen.getByText('Signup Page')).toBeInTheDocument();
  });

  it('renders protected routes when signed in', () => {
    mocks.auth.loading = false;
    mocks.auth.user = { email: 'customer@example.com' };
    const first = render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
    expect(screen.getByText('Home Page')).toBeInTheDocument();

    first.unmount();
    render(<MemoryRouter initialEntries={['/my-bookings']}><App /></MemoryRouter>);
    expect(screen.getByText('Bookings Page')).toBeInTheDocument();
  });

  it('renders the owner route for a signed-in owner', () => {
    mocks.auth.loading = false;
    mocks.auth.user = { email: 'owner@bookmycut.com' };
    render(<MemoryRouter initialEntries={['/owner']}><App /></MemoryRouter>);
    expect(screen.getByText('Owner Page')).toBeInTheDocument();
  });

  it('redirects signed-out users away from protected routes', () => {
    mocks.auth.loading = false;
    mocks.auth.user = null;
    render(<MemoryRouter initialEntries={['/my-bookings']}><App /></MemoryRouter>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
