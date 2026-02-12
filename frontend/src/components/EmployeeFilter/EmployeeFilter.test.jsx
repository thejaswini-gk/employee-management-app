import { render, screen } from '@testing-library/react';
import EmployeeFilter from './EmployeeFilter';

// Mock the employeeService
jest.mock('../../services/employeeService', () => ({
  __esModule: true,
  default: {
    getDepartments: jest.fn(() => Promise.resolve({ success: true, data: ['Engineering', 'HR', 'Marketing'] })),
  },
}));

describe('EmployeeFilter Component', () => {
  const mockOnFilterChange = jest.fn();

  test('renders search input', () => {
    render(<EmployeeFilter onFilterChange={mockOnFilterChange} />);
    const searchInput = screen.getByPlaceholderText(/Search by name/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('renders department filter', () => {
    render(<EmployeeFilter onFilterChange={mockOnFilterChange} />);
    const selectElement = screen.getByLabelText(/Filter by department/i);
    expect(selectElement).toBeInTheDocument();
  });
});
