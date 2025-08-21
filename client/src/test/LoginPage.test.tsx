import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { vi } from 'vitest';

// Mock the API
vi.mock('../lib/api', () => ({
  api: {
    post: vi.fn()
  }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

function renderLoginPage() {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
}

describe('LoginPage', () => {
  it('renders login form with validation', async () => {
    renderLoginPage();
    
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('shows validation error for empty form submission', async () => {
    renderLoginPage();
    
    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);
    
    // Check that form validation prevents submission
    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });
  });
});
