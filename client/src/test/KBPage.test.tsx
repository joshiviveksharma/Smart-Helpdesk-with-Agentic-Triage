import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KBPage } from '../pages/KBPage';
import { vi } from 'vitest';

// Mock the API
vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn()
  }
}));

describe('KBPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders KB search page', () => {
    const { api } = require('../lib/api');
    api.get.mockResolvedValue({ data: { items: [] } });
    render(<KBPage />);
    
    expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('searches KB articles', async () => {
    const mockArticles = [
      { _id: '1', title: 'Troubleshooting 500 errors', body: 'Check logs', status: 'published' },
      { _id: '2', title: 'Payment issues', body: 'Contact support', status: 'published' }
    ];
    
    const { api } = require('../lib/api');
    api.get.mockResolvedValue({ data: { items: mockArticles } });
    render(<KBPage />);
    
    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: '500' } });
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/kb', { params: { query: '500' } });
    });
    
    expect(screen.getByText('Troubleshooting 500 errors')).toBeInTheDocument();
    expect(screen.getByText('Payment issues')).toBeInTheDocument();
  });
});
