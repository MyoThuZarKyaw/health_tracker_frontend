import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MealList from '@/components/activities/MealList';
import { activitiesAPI } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api', () => ({
  activitiesAPI: {
    getMeals: jest.fn(),
    deleteMeal: jest.fn(),
    updateMeal: jest.fn(),
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
        {activity && <div data-testid="edit-mode">Editing {activity.meal_type}</div>}
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
  Flame: () => <div data-testid="flame-icon" />,
}));

const mockMeals = [
  {
    id: 1,
    date: '2024-01-15',
    meal_type: 'breakfast',
    food_name: 'Oatmeal',
    calories: 300,
    status: 'consumed',
    description: 'Healthy morning meal',
  },
  {
    id: 2,
    date: '2024-01-16',
    meal_type: 'lunch',
    food_name: 'Salad',
    calories: 250,
    status: 'planned',
    description: 'Light lunch option',
  },
];

describe('MealList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (activitiesAPI.getMeals as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<MealList />);

    expect(screen.getByText('Loading meals...')).toBeInTheDocument();
  });

  it('renders empty state when no meals exist', async () => {
    (activitiesAPI.getMeals as jest.Mock).mockResolvedValue({ data: [] });

    render(<MealList />);

    await waitFor(() => {
      expect(screen.getByText('No meals logged yet')).toBeInTheDocument();
      expect(screen.getByText('Click "Log Activity" to add your first meal')).toBeInTheDocument();
    });
  });

  it('renders meal list correctly', async () => {
    (activitiesAPI.getMeals as jest.Mock).mockResolvedValue({ data: mockMeals });

    render(<MealList />);

    await waitFor(() => {
      expect(screen.getByText('breakfast')).toBeInTheDocument();
      expect(screen.getByText('lunch')).toBeInTheDocument();
      expect(screen.getByText('Oatmeal')).toBeInTheDocument();
      expect(screen.getByText('Salad')).toBeInTheDocument();
    });
  });

  it('displays meal details correctly', async () => {
    (activitiesAPI.getMeals as jest.Mock).mockResolvedValue({ data: mockMeals });

    render(<MealList />);

    await waitFor(() => {
      expect(screen.getByText('300 cal')).toBeInTheDocument();
      expect(screen.getByText('250 cal')).toBeInTheDocument();
    });
  });

  it('shows correct status badges', async () => {
    (activitiesAPI.getMeals as jest.Mock).mockResolvedValue({ data: mockMeals });

    render(<MealList />);

    await waitFor(() => {
      const consumedBadge = screen.getByText('consumed');
      const plannedBadge = screen.getByText('planned');

      expect(consumedBadge).toHaveAttribute('data-variant', 'default');
      expect(plannedBadge).toHaveAttribute('data-variant', 'secondary');
    });
  });

  it('allows status toggle', async () => {
    (activitiesAPI.getMeals as jest.Mock).mockResolvedValue({ data: mockMeals });
    (activitiesAPI.updateMeal as jest.Mock).mockResolvedValue({});

    render(<MealList />);

    await waitFor(() => {
      const consumedBadge = screen.getByText('consumed');
      fireEvent.click(consumedBadge);
    });

    expect(activitiesAPI.updateMeal).toHaveBeenCalledWith(1, {
      ...mockMeals[0],
      status: 'planned',
    });
  });

  it('deletes meal successfully', async () => {
    (activitiesAPI.getMeals as jest.Mock).mockResolvedValue({ data: mockMeals });
    (activitiesAPI.deleteMeal as jest.Mock).mockResolvedValue({});

    render(<MealList />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('trash-icon');
      fireEvent.click(deleteButtons[0].parentElement!);
    });

    expect(activitiesAPI.deleteMeal).toHaveBeenCalledWith(1);
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (activitiesAPI.getMeals as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<MealList />);

    // Wait for the component to attempt loading and fail
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if the error was logged (the exact message might vary due to React warnings)
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles delete error gracefully', async () => {
    (activitiesAPI.getMeals as jest.Mock).mockResolvedValue({ data: mockMeals });
    (activitiesAPI.deleteMeal as jest.Mock).mockRejectedValue(new Error('Delete failed'));

    render(<MealList />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('trash-icon');
      fireEvent.click(deleteButtons[0].parentElement!);
    });

    expect(activitiesAPI.deleteMeal).toHaveBeenCalledWith(1);
  });

  it('formats dates correctly', async () => {
    (activitiesAPI.getMeals as jest.Mock).mockResolvedValue({ data: mockMeals });

    render(<MealList />);

    await waitFor(() => {
      // Date formatting depends on locale, but we can check that dates are displayed
      const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it('renders icons correctly', async () => {
    (activitiesAPI.getMeals as jest.Mock).mockResolvedValue({ data: mockMeals });

    render(<MealList />);

    await waitFor(() => {
      expect(screen.getAllByTestId('flame-icon')).toHaveLength(2);
      expect(screen.getAllByTestId('trash-icon')).toHaveLength(2);
    });
  });
});