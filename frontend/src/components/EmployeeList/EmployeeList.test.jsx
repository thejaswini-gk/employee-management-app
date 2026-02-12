import { render, screen } from '@testing-library/react';
import EmployeeList from './EmployeeList';

describe('EmployeeList Component', () => {
  const mockEmployees = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      department: 'Engineering',
      role: 'Developer',
      hire_date: '2024-01-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      department: 'HR',
      role: 'Manager',
      hire_date: '2024-02-01',
    },
  ];

  test('renders loading state', () => {
    render(<EmployeeList employees={[]} loading={true} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText(/Loading employees/i)).toBeInTheDocument();
  });

  test('renders empty state when no employees', () => {
    render(<EmployeeList employees={[]} loading={false} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText(/No employees found/i)).toBeInTheDocument();
  });

  test('renders employee count', () => {
    render(<EmployeeList employees={mockEmployees} loading={false} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText(/2 employees found/i)).toBeInTheDocument();
  });

  test('renders all employees', () => {
    render(<EmployeeList employees={mockEmployees} loading={false} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
});
