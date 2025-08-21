import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TicketsPage } from '../pages/TicketsPage';
import { vi } from 'vitest';

// Mock the API
vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

function renderTicketsPage() {
  return render(
    <BrowserRouter>
      <TicketsPage />
    </BrowserRouter>
  );
}

describe('TicketsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const { api } = require('../lib/api');
    api.get.mockResolvedValue({ data: { items: [] } });
  });

  it('renders ticket creation form', () => {
    renderTicketsPage();
    
    expect(screen.getByText('My Tickets')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('creates a new ticket', async () => {
    const mockTicket = { _id: '123', title: 'Test Ticket', status: 'open' };
    const { api } = require('../lib/api');
    api.post.mockResolvedValue({ data: mockTicket });
    
    renderTicketsPage();
    
    const titleInput = screen.getByPlaceholderText('Title');
    const descInput = screen.getByPlaceholderText('Description');
    const submitButton = screen.getByRole('button', { name: 'Create' });
    
    fireEvent.change(titleInput, { target: { value: 'Test Ticket' } });
    fireEvent.change(descInput, { target: { value: 'Test Description' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/tickets', {
        title: 'Test Ticket',
        description: 'Test Description'
      });
    });
  });
});
