import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the employeeService
jest.mock('./services/employeeService', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(() => Promise.resolve({ success: true, data: [] })),
    getDepartments: jest.fn(() => Promise.resolve({ success: true, data: [] })),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

test('renders Employee Management System header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Employee Management System/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders Add Employee button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Add Employee/i);
  expect(buttonElement).toBeInTheDocument();
});
