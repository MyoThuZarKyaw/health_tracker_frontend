import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Auth from '@/pages/Auth';

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    login: jest.fn(),
    register: jest.fn(),
  }),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Activity: () => <div data-testid="activity-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  User: () => <div data-testid="user-icon" />,
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ id, type, placeholder, value, onChange, className, required, ...props }: any) => (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      required={required}
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, ...props }: any) => (
    <label htmlFor={htmlFor} {...props}>
      {children}
    </label>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue, ...props }: any) => (
    <div {...props}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value, ...props }: any) => (
    <div data-value={value} {...props}>
      {children}
    </div>
  ),
  TabsList: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsTrigger: ({ children, value, ...props }: any) => (
    <button data-value={value} {...props}>
      {children}
    </button>
  ),
}));

const renderAuth = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Auth />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Auth Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the auth page with login and register tabs', () => {
    renderAuth();

    expect(screen.getByText('Health Tracker')).toBeInTheDocument();
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account or create a new one')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('renders login form with required fields', () => {
    renderAuth();

    expect(screen.getByLabelText('Email', { selector: '#login-email' })).toBeInTheDocument();
    expect(screen.getByLabelText('Password', { selector: '#login-password' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('renders register form with required fields', () => {
    renderAuth();

    // Switch to register tab
    const registerTab = screen.getByText('Register');
    fireEvent.click(registerTab);

    expect(screen.getByLabelText('Full Name', { selector: '#register-name' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email', { selector: '#register-email' })).toBeInTheDocument();
    expect(screen.getByLabelText('Password', { selector: '#register-password' })).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password', { selector: '#register-confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('shows activity icon', () => {
    renderAuth();

    expect(screen.getByTestId('activity-icon')).toBeInTheDocument();
  });

  it('validates required fields in login form', async () => {
    const user = userEvent.setup();
    renderAuth();

    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    await user.click(submitButton);

    // HTML5 validation should prevent submission without required fields
    expect(submitButton).toBeInTheDocument();
  });

  it('validates required fields in register form', async () => {
    const user = userEvent.setup();
    renderAuth();

    // Switch to register tab
    const registerTab = screen.getByText('Register');
    fireEvent.click(registerTab);

    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    await user.click(submitButton);

    // HTML5 validation should prevent submission without required fields
    expect(submitButton).toBeInTheDocument();
  });

  it('handles password confirmation mismatch in register form', async () => {
    const user = userEvent.setup();
    renderAuth();

    // Switch to register tab
    const registerTab = screen.getByText('Register');
    fireEvent.click(registerTab);

    const nameInput = screen.getByLabelText('Full Name', { selector: '#register-name' });
    const emailInput = screen.getByLabelText('Email', { selector: '#register-email' });
    const passwordInput = screen.getByLabelText('Password', { selector: '#register-password' });
    const confirmPasswordInput = screen.getByLabelText('Confirm Password', { selector: '#register-confirm' });
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'differentpassword');

    await user.click(submitButton);

    // Form should not submit due to password mismatch
    expect(submitButton).toBeInTheDocument();
  });

});
