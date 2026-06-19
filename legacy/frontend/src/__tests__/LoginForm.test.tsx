import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';

import { LoginForm } from '@/components/LoginForm';

vi.mock('axios');

describe('LoginForm', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login mode by default', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
  });

  it('toggles to register mode and shows name field', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it('submits login with exact payload', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { message: 'Hello' } });

    render(<LoginForm onLogin={mockOnLogin} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/login',
        { email: 'test@example.com', password: 'secret123' },
        { withCredentials: true },
      );
    });
    expect(mockOnLogin).toHaveBeenCalled();
  });

  it('submits register with exact payload', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { message: 'Welcome' } });

    render(<LoginForm onLogin={mockOnLogin} />);
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/login/register',
        { email: 'new@example.com', password: 'pass123', name: 'Test User' },
        { withCredentials: true },
      );
    });
  });

  it('displays server error message', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } },
    });

    render(<LoginForm onLogin={mockOnLogin} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
