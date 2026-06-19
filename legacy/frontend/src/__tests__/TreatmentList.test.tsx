import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';

import { TreatmentList } from '@/components/TreatmentList';

vi.mock('axios');

describe('TreatmentList', () => {
  const mockTreatments = [
    {
      id: 1,
      name: 'Antibiotics',
      interval: 8,
      medicine: [{ name: 'Amox', dosage: '500mg', quantity: '2' }],
      slug: 'test-slug-1',
      createdAt: '2026-06-13T10:00:00Z',
    },
    {
      id: 2,
      name: 'Vitamins',
      interval: 24,
      medicine: [{ name: 'D3', dosage: '1000IU', quantity: '1' }],
      slug: 'test-slug-2',
      createdAt: '2026-06-13T11:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders treatments fetched from API', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockTreatments });

    render(<TreatmentList />);

    await waitFor(() => {
      expect(screen.getByText('Antibiotics')).toBeInTheDocument();
      expect(screen.getByText('Vitamins')).toBeInTheDocument();
    });
    expect(screen.getByText('Every 8h')).toBeInTheDocument();
    expect(screen.getByText('Every 24h')).toBeInTheDocument();
  });

  it('shows empty state when no treatments', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] });

    render(<TreatmentList />);

    await waitFor(() => {
      expect(screen.getByText(/no treatments yet/i)).toBeInTheDocument();
    });
  });

  it('toggles QR code display', async () => {
    vi.mocked(axios.get).mockImplementation((url: string) => {
      if (url === '/treatments') return Promise.resolve({ data: mockTreatments });
      if (url.includes('/doses')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });

    render(<TreatmentList />);

    await waitFor(() => {
      expect(screen.getByText('Antibiotics')).toBeInTheDocument();
    });

    const qrButton = screen.getAllByRole('button', { name: /show qr/i })[0];
    fireEvent.click(qrButton);

    await waitFor(() => {
      expect(screen.getByAltText(/qr for antibiotics/i)).toBeInTheDocument();
    });
  });

  it('fetches and displays dose history', async () => {
    vi.mocked(axios.get).mockImplementation((url: string) => {
      if (url === '/treatments') return Promise.resolve({ data: mockTreatments });
      if (url.includes('/doses')) {
        return Promise.resolve({
          data: [
            { id: 1, createdAt: '2026-06-13T12:00:00Z', confirmedVia: 'qr_scan' },
          ],
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(<TreatmentList />);

    await waitFor(() => {
      expect(screen.getByText('Antibiotics')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('button', { name: /refresh history/i })[0]);

    await waitFor(() => {
      expect(screen.getByText(/qr scan/i)).toBeInTheDocument();
    });
  });
});
