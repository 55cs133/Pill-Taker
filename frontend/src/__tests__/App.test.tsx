import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';

import App from '@/App';

vi.mock('axios');

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows login form when unauthenticated', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce({ response: { status: 401 } });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  it('shows dashboard when authenticated', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { name: 'Test User', email: 'test@example.com' },
    });
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('logs out and returns to login form', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { name: 'Test User', email: 'test@example.com' },
    });
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] });
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { message: 'Logged out' } });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });
  });
});
