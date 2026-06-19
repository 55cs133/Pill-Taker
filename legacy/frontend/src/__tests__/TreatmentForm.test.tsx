import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';

import { TreatmentForm } from '@/components/TreatmentForm';

vi.mock('axios');

describe('TreatmentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields', () => {
    render(<TreatmentForm />);
    expect(screen.getByPlaceholderText('Treatment name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Hours between each take')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Medicine name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Dosage of substance')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Amount of pills')).toBeInTheDocument();
  });

  it('submits with exact payload', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { id: 1 } });

    render(<TreatmentForm />);
    fireEvent.change(screen.getByPlaceholderText('Treatment name'), { target: { value: 'Antibiotics' } });
    fireEvent.change(screen.getByPlaceholderText('Hours between each take'), { target: { value: '8' } });
    fireEvent.change(screen.getByPlaceholderText('Medicine name'), { target: { value: 'Amox' } });
    fireEvent.change(screen.getByPlaceholderText('Dosage of substance'), { target: { value: '500mg' } });
    fireEvent.change(screen.getByPlaceholderText('Amount of pills'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/treatments',
        {
          treatmentName: 'Antibiotics',
          interval: '8',
          medicines: [{ name: 'Amox', dosage: '500mg', quantity: '2' }],
        },
        { withCredentials: true },
      );
    });
  });

  it('adds medicine fields dynamically', () => {
    render(<TreatmentForm />);
    expect(screen.getAllByPlaceholderText('Medicine name')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: /add medicine/i }));
    expect(screen.getAllByPlaceholderText('Medicine name')).toHaveLength(2);
  });
});
