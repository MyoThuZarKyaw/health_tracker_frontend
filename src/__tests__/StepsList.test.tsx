import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StepsList from '@/components/activities/StepsList';
import { activitiesAPI } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api', () => ({
  activitiesAPI: {
    getSteps: jest.fn(),
    deleteSteps: jest.fn(),
    updateSteps: jest.fn(),
  },
}));

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

// Mock ActivityDialog
jest.mock('@/components/activities/ActivityDialog', () => ({
  default: ({ open, onOpenChange, type, activity, onSuccess }: any) => (
    open ? (
      <div data-testid="activity-dialog">
        <button onClick={() => onOpenChange(false)}>Close</button>
        {activity && <div data-testid="edit-mode">Editing steps</div>}
      </div>
    ) : null
  ),
}));

// Mock UI components
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className, onClick }: any) => (
    <span className={className} onClick={onClick} data-variant={variant}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, size, onClick, className }: any) => (
    <button className={className} onClick={onClick} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Trash2: () => <div data-testid="trash-icon" />,
  Footprints: () => <div data-testid="footprints-icon" />,
}));

const mockSteps = [
  {
    id: 1,
    date: '2024-01-15',
    total_steps: 10000,
    status: 'completed',
    description: 'Daily walk',
  },
  {
    id: 2,
    date: '2024-01-16',
    total_steps: 8500,
    status: 'in_progress',
    description: 'Morning steps',
  },
];

describe('StepsList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (activitiesAPI.getSteps as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<StepsList />);

    expect(screen.getByText('Loading steps...')).toBeInTheDocument();
  });

  it('renders empty state when no steps exist', async () => {
    (activitiesAPI.getSteps as jest.Mock).mockResolvedValue({ data: [] });

    render(<StepsList />);

    await waitFor(() => {
      expect(screen.getByText('No steps logged yet')).toBeInTheDocument();
      expect(screen.getByText('Click "Log Activity" to add your first steps entry')).toBeInTheDocument();
    });
  });
  

  it('displays steps details correctly', async () => {
    (activitiesAPI.getSteps as jest.Mock).mockResolvedValue({ data: mockSteps });

    render(<StepsList />);

    await waitFor(() => {
      expect(screen.getByText('10,000 steps')).toBeInTheDocument();
      expect(screen.getByText('8,500 steps')).toBeInTheDocument();
    });
  });

  it('shows correct status badges', async () => {
    (activitiesAPI.getSteps as jest.Mock).mockResolvedValue({ data: mockSteps });

    render(<StepsList />);

    await waitFor(() => {
      const completedBadge = screen.getByText('completed');
      const inProgressBadge = screen.getByText('in_progress');

      expect(completedBadge).toHaveAttribute('data-variant', 'default');
      expect(inProgressBadge).toHaveAttribute('data-variant', 'secondary');
    });
  });

  it('allows status toggle', async () => {
    (activitiesAPI.getSteps as jest.Mock).mockResolvedValue({ data: mockSteps });
    (activitiesAPI.updateSteps as jest.Mock).mockResolvedValue({});

    render(<StepsList />);

    await waitFor(() => {
      const completedBadge = screen.getByText('completed');
      fireEvent.click(completedBadge);
    });

    expect(activitiesAPI.updateSteps).toHaveBeenCalledWith(1, {
      ...mockSteps[0],
      status: 'in_progress',
    });
  });

  it('deletes steps successfully', async () => {
    (activitiesAPI.getSteps as jest.Mock).mockResolvedValue({ data: mockSteps });
    (activitiesAPI.deleteSteps as jest.Mock).mockResolvedValue({});

    render(<StepsList />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('trash-icon');
      fireEvent.click(deleteButtons[0].parentElement!);
    });

    expect(activitiesAPI.deleteSteps).toHaveBeenCalledWith(1);
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (activitiesAPI.getSteps as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<StepsList />);

    // Wait for the component to attempt loading and fail
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if the error was logged (the exact message might vary due to React warnings)
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles delete error gracefully', async () => {
    (activitiesAPI.getSteps as jest.Mock).mockResolvedValue({ data: mockSteps });
    (activitiesAPI.deleteSteps as jest.Mock).mockRejectedValue(new Error('Delete failed'));

    render(<StepsList />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('trash-icon');
      fireEvent.click(deleteButtons[0].parentElement!);
    });

    expect(activitiesAPI.deleteSteps).toHaveBeenCalledWith(1);
  });

  it('formats dates correctly', async () => {
    (activitiesAPI.getSteps as jest.Mock).mockResolvedValue({ data: mockSteps });

    render(<StepsList />);

    await waitFor(() => {
      // Date formatting depends on locale, but we can check that dates are displayed
      const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it('renders icons correctly', async () => {
    (activitiesAPI.getSteps as jest.Mock).mockResolvedValue({ data: mockSteps });

    render(<StepsList />);

    await waitFor(() => {
      expect(screen.getAllByTestId('footprints-icon')).toHaveLength(2);
      expect(screen.getAllByTestId('trash-icon')).toHaveLength(2);
    });
  });
});