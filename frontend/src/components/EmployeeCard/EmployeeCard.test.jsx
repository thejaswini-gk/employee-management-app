import { render, screen } from '@testing-library/react';
import EmployeeCard from './EmployeeCard';

describe('EmployeeCard Component', () => {
  const mockEmployee = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    department: 'Engineering',
    role: 'Software Engineer',
    hire_date: '2024-01-15',
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  test('renders employee information', () => {
    render(<EmployeeCard employee={mockEmployee} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  test('renders Edit and Delete buttons', () => {
    render(<EmployeeCard employee={mockEmployee} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
