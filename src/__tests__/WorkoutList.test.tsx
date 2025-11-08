import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkoutList from '@/components/activities/WorkoutList';
import { activitiesAPI } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api', () => ({
  activitiesAPI: {
    getWorkouts: jest.fn(),
    deleteWorkout: jest.fn(),
    updateWorkout: jest.fn(),
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
        {activity && <div data-testid="edit-mode">Editing {activity.workout_type}</div>}
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
  Clock: () => <div data-testid="clock-icon" />,
  Flame: () => <div data-testid="flame-icon" />,
}));

const mockWorkouts = [
  {
    id: 1,
    date: '2024-01-15',
    workout_type: 'running',
    duration: 30,
    calories_burned: 300,
    status: 'completed',
    description: 'Morning run in the park',
  },
  {
    id: 2,
    date: '2024-01-16',
    workout_type: 'weightlifting',
    duration: 45,
    calories_burned: 250,
    status: 'planned',
    description: 'Upper body strength training',
  },
];

describe('WorkoutList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (activitiesAPI.getWorkouts as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<WorkoutList />);

    expect(screen.getByText('Loading workouts...')).toBeInTheDocument();
  });

  it('renders empty state when no workouts exist', async () => {
    (activitiesAPI.getWorkouts as jest.Mock).mockResolvedValue({ data: [] });

    render(<WorkoutList />);

    await waitFor(() => {
      expect(screen.getByText('No workouts logged yet')).toBeInTheDocument();
      expect(screen.getByText('Click "Log Activity" to add your first workout')).toBeInTheDocument();
    });
  });

  it('renders workout list correctly', async () => {
    (activitiesAPI.getWorkouts as jest.Mock).mockResolvedValue({ data: mockWorkouts });

    render(<WorkoutList />);

    await waitFor(() => {
      expect(screen.getByText('running')).toBeInTheDocument();
      expect(screen.getByText('weightlifting')).toBeInTheDocument();
      expect(screen.getByText('Morning run in the park')).toBeInTheDocument();
      expect(screen.getByText('Upper body strength training')).toBeInTheDocument();
    });
  });

  it('displays workout details correctly', async () => {
    (activitiesAPI.getWorkouts as jest.Mock).mockResolvedValue({ data: mockWorkouts });

    render(<WorkoutList />);

    await waitFor(() => {
      expect(screen.getByText('30 min')).toBeInTheDocument();
      expect(screen.getByText('300 cal')).toBeInTheDocument();
      expect(screen.getByText('45 min')).toBeInTheDocument();
      expect(screen.getByText('250 cal')).toBeInTheDocument();
    });
  });

  it('shows correct status badges', async () => {
    (activitiesAPI.getWorkouts as jest.Mock).mockResolvedValue({ data: mockWorkouts });

    render(<WorkoutList />);

    await waitFor(() => {
      const completedBadge = screen.getByText('completed');
      const plannedBadge = screen.getByText('planned');

      expect(completedBadge).toHaveAttribute('data-variant', 'default');
      expect(plannedBadge).toHaveAttribute('data-variant', 'secondary');
    });
  });

  it('allows status toggle', async () => {
    (activitiesAPI.getWorkouts as jest.Mock).mockResolvedValue({ data: mockWorkouts });
    (activitiesAPI.updateWorkout as jest.Mock).mockResolvedValue({});

    render(<WorkoutList />);

    await waitFor(() => {
      const completedBadge = screen.getByText('completed');
      fireEvent.click(completedBadge);
    });

    expect(activitiesAPI.updateWorkout).toHaveBeenCalledWith(1, {
      ...mockWorkouts[0],
      status: 'planned',
    });
  });


  it('deletes workout successfully', async () => {
    (activitiesAPI.getWorkouts as jest.Mock).mockResolvedValue({ data: mockWorkouts });
    (activitiesAPI.deleteWorkout as jest.Mock).mockResolvedValue({});

    render(<WorkoutList />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('trash-icon');
      fireEvent.click(deleteButtons[0].parentElement!);
    });

    expect(activitiesAPI.deleteWorkout).toHaveBeenCalledWith(1);
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (activitiesAPI.getWorkouts as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<WorkoutList />);

    // Wait for the component to attempt loading and fail
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if the error was logged (the exact message might vary due to React warnings)
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles delete error gracefully', async () => {
    (activitiesAPI.getWorkouts as jest.Mock).mockResolvedValue({ data: mockWorkouts });
    (activitiesAPI.deleteWorkout as jest.Mock).mockRejectedValue(new Error('Delete failed'));

    render(<WorkoutList />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('trash-icon');
      fireEvent.click(deleteButtons[0].parentElement!);
    });

    expect(activitiesAPI.deleteWorkout).toHaveBeenCalledWith(1);
  });

  it('formats dates correctly', async () => {
    (activitiesAPI.getWorkouts as jest.Mock).mockResolvedValue({ data: mockWorkouts });

    render(<WorkoutList />);

    await waitFor(() => {
      // Date formatting depends on locale, but we can check that dates are displayed
      const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it('renders icons correctly', async () => {
    (activitiesAPI.getWorkouts as jest.Mock).mockResolvedValue({ data: mockWorkouts });

    render(<WorkoutList />);

    await waitFor(() => {
      expect(screen.getAllByTestId('clock-icon')).toHaveLength(2);
      expect(screen.getAllByTestId('flame-icon')).toHaveLength(2);
      expect(screen.getAllByTestId('trash-icon')).toHaveLength(2);
    });
  });
});