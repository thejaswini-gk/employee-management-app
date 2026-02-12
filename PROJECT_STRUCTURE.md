# Employee Management System - Project Structure Guide

## Quick Reference

This document provides a quick reference for the project structure, key files, and their purposes.

---

## Directory Tree

```
employee-management-app/
│
├── backend/                          # Backend Node.js/Express application
│   ├── src/                          # Source code
│   │   ├── config/                   # Configuration files
│   │   │   ├── database.js           # SQLite database configuration and setup
│   │   │   └── rateLimiter.js        # Rate limiting configuration (100 req/15min)
│   │   │
│   │   ├── controllers/              # Request handlers and business logic
│   │   │   └── employeeController.js # Employee CRUD operations controller
│   │   │
│   │   ├── middleware/               # Express middleware
│   │   │   ├── errorHandler.js       # Global error handling middleware
│   │   │   └── validator.js          # Request validation middleware
│   │   │
│   │   ├── models/                   # Data access layer
│   │   │   └── employeeModel.js      # Employee database queries (CRUD, search, filter)
│   │   │
│   │   ├── routes/                   # API route definitions
│   │   │   └── employeeRoutes.js     # Employee API endpoints
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── logger.js             # Logging utility (Winston)
│   │   │   └── validation.js         # Validation helper functions
│   │   │
│   │   ├── app.js                    # Express app configuration and middleware setup
│   │   └── server.js                 # Server entry point (starts the app)
│   │
│   ├── tests/                        # Test files
│   │   ├── integration/              # API integration tests
│   │   │   └── employee.test.js      # Test all employee endpoints
│   │   │
│   │   ├── unit/                     # Unit tests
│   │   │   ├── employeeController.test.js  # Controller logic tests
│   │   │   └── employeeModel.test.js       # Model/database tests
│   │   │
│   │   └── setup.js                  # Test configuration and setup
│   │
│   ├── database/                     # Database storage
│   │   └── employees.db              # SQLite database file (gitignored)
│   │
│   ├── .env                          # Environment variables (gitignored)
│   ├── .env.example                  # Environment variables template
│   ├── .eslintrc.js                  # ESLint configuration
│   ├── .prettierrc                   # Prettier code formatting config
│   ├── .gitignore                    # Git ignore patterns
│   ├── package.json                  # Backend dependencies and scripts
│   └── README.md                     # Backend documentation
│
├── frontend/                         # Frontend React application
│   ├── public/                       # Static assets
│   │   ├── index.html                # HTML template
│   │   └── favicon.ico               # App icon
│   │
│   ├── src/                          # Source code
│   │   ├── components/               # React components
│   │   │   │
│   │   │   ├── EmployeeCard/         # Individual employee display card
│   │   │   │   ├── EmployeeCard.jsx
│   │   │   │   ├── EmployeeCard.module.css
│   │   │   │   └── EmployeeCard.test.jsx
│   │   │   │
│   │   │   ├── EmployeeFilter/       # Search and filter controls
│   │   │   │   ├── EmployeeFilter.jsx
│   │   │   │   ├── EmployeeFilter.module.css
│   │   │   │   └── EmployeeFilter.test.jsx
│   │   │   │
│   │   │   ├── EmployeeForm/         # Add/Edit employee form (modal)
│   │   │   │   ├── EmployeeForm.jsx
│   │   │   │   ├── EmployeeForm.module.css
│   │   │   │   └── EmployeeForm.test.jsx
│   │   │   │
│   │   │   ├── EmployeeList/         # List of employee cards
│   │   │   │   ├── EmployeeList.jsx
│   │   │   │   ├── EmployeeList.module.css
│   │   │   │   └── EmployeeList.test.jsx
│   │   │   │
│   │   │   └── common/               # Reusable components
│   │   │       ├── Button/           # Custom button component
│   │   │       ├── Input/            # Custom input component
│   │   │       ├── Modal/            # Modal dialog component
│   │   │       └── Spinner/          # Loading spinner
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   └── EmployeeDashboard/    # Main dashboard page
│   │   │       ├── EmployeeDashboard.jsx
│   │   │       ├── EmployeeDashboard.module.css
│   │   │       └── EmployeeDashboard.test.jsx
│   │   │
│   │   ├── services/                 # External service integrations
│   │   │   └── api.js                # API service layer (Axios wrapper)
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   └── useEmployees.js       # Employee data management hook
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── constants.js          # App constants (API URLs, etc.)
│   │   │   └── validators.js         # Form validation functions
│   │   │
│   │   ├── App.jsx                   # Root component
│   │   ├── App.css                   # Global styles
│   │   ├── index.jsx                 # Entry point (renders App)
│   │   └── setupTests.js             # Test environment setup
│   │
│   ├── .env                          # Environment variables (gitignored)
│   ├── .env.example                  # Environment variables template
│   ├── .eslintrc.js                  # ESLint configuration
│   ├── .prettierrc                   # Prettier configuration
│   ├── .gitignore                    # Git ignore patterns
│   ├── package.json                  # Frontend dependencies and scripts
│   └── README.md                     # Frontend documentation
│
├── .github/                          # GitHub configuration
│   └── workflows/                    # GitHub Actions CI/CD
│       ├── backend-ci.yml            # Backend test and build workflow
│       ├── frontend-ci.yml           # Frontend test and build workflow
│       └── deploy.yml                # Deployment workflow
│
├── docs/                             # Additional documentation
│   ├── API.md                        # API documentation
│   ├── DEPLOYMENT.md                 # Deployment guide
│   └── CONTRIBUTING.md               # Contribution guidelines
│
├── .gitignore                        # Root gitignore
├── DESIGN.md                         # Technical design document (this file)
├── PROJECT_STRUCTURE.md              # This file
├── README.md                         # Project overview
├── package.json                      # Root package.json for workspace scripts
└── docker-compose.yml                # Docker configuration (optional)
```

---

## Key Files Explained

### Backend Files

#### `backend/src/server.js`
**Purpose:** Application entry point  
**Responsibilities:**
- Start Express server
- Connect to database
- Handle graceful shutdown
- Initialize application

**Key Code:**
```javascript
const app = require('./app');
const db = require('./config/database');

const PORT = process.env.PORT || 5000;

db.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
```

---

#### `backend/src/app.js`
**Purpose:** Express application setup  
**Responsibilities:**
- Configure middleware (CORS, helmet, rate limiting)
- Mount routes
- Set up error handling
- Export app for testing

**Middleware Order:**
1. Helmet (security headers)
2. CORS
3. Body parser
4. Rate limiter
5. Routes
6. Error handler

---

#### `backend/src/config/database.js`
**Purpose:** Database configuration and initialization  
**Responsibilities:**
- Create SQLite connection
- Initialize database schema
- Provide database access methods
- Handle database errors

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    role TEXT NOT NULL,
    hire_date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

#### `backend/src/config/rateLimiter.js`
**Purpose:** Rate limiting configuration  
**Specifications:**
- 100 requests per 15 minutes per IP
- Returns 429 status when exceeded
- Custom error message

---

#### `backend/src/models/employeeModel.js`
**Purpose:** Data access layer for employees  
**Methods:**
- `getAll(filters)` - Get all employees with optional search/filter
- `getById(id)` - Get single employee by ID
- `create(employee)` - Create new employee
- `update(id, employee)` - Update existing employee
- `delete(id)` - Delete employee

**Query Examples:**
```javascript
// Search by name
db.all(
  'SELECT * FROM employees WHERE name LIKE ? COLLATE NOCASE',
  [`%${search}%`]
);

// Filter by department
db.all(
  'SELECT * FROM employees WHERE department = ?',
  [department]
);
```

---

#### `backend/src/controllers/employeeController.js`
**Purpose:** Request handling and business logic  
**Responsibilities:**
- Validate request data
- Call model methods
- Format responses
- Handle errors

**Response Format:**
```javascript
// Success
{
  success: true,
  data: { /* employee data */ },
  message: "Operation successful"
}

// Error
{
  success: false,
  error: "Error message",
  errors: [{ field: "email", message: "Invalid email" }]
}
```

---

#### `backend/src/routes/employeeRoutes.js`
**Purpose:** API endpoint definitions  
**Routes:**
```javascript
GET    /api/employees        # Get all employees (with search/filter)
GET    /api/employees/:id    # Get single employee
POST   /api/employees        # Create employee
PUT    /api/employees/:id    # Update employee
DELETE /api/employees/:id    # Delete employee
```

---

#### `backend/src/middleware/errorHandler.js`
**Purpose:** Centralized error handling  
**Handles:**
- Validation errors (400)
- Not found errors (404)
- Database errors (500)
- Rate limit errors (429)

---

#### `backend/src/middleware/validator.js`
**Purpose:** Request validation  
**Validates:**
- Required fields
- Email format and uniqueness
- Date format (YYYY-MM-DD)
- Data types

**Using express-validator:**
```javascript
const { body, validationResult } = require('express-validator');

const validateEmployee = [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('department').notEmpty().trim(),
  body('role').notEmpty().trim(),
  body('hire_date').matches(/^\d{4}-\d{2}-\d{2}$/)
];
```

---

### Frontend Files

#### `frontend/src/index.jsx`
**Purpose:** Application entry point  
**Responsibilities:**
- Render root component
- Mount to DOM
- Wrap with providers

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

#### `frontend/src/App.jsx`
**Purpose:** Root component  
**Responsibilities:**
- Application layout
- Routing (if needed)
- Global state providers

---

#### `frontend/src/services/api.js`
**Purpose:** API communication layer  
**Responsibilities:**
- Configure Axios instance
- Define API methods
- Handle errors
- Transform requests/responses

**API Methods:**
```javascript
const api = {
  // Fetch all employees with optional filters
  getEmployees: (params) => 
    axios.get('/employees', { params }),
  
  // Fetch single employee
  getEmployee: (id) => 
    axios.get(`/employees/${id}`),
  
  // Create new employee
  createEmployee: (data) => 
    axios.post('/employees', data),
  
  // Update existing employee
  updateEmployee: (id, data) => 
    axios.put(`/employees/${id}`, data),
  
  // Delete employee
  deleteEmployee: (id) => 
    axios.delete(`/employees/${id}`)
};
```

---

#### `frontend/src/hooks/useEmployees.js`
**Purpose:** Custom hook for employee data  
**Features:**
- Fetch employees
- Handle loading states
- Error handling
- Cache management

**Usage:**
```jsx
const {
  employees,
  loading,
  error,
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = useEmployees();
```

---

#### `frontend/src/pages/EmployeeDashboard/EmployeeDashboard.jsx`
**Purpose:** Main dashboard container  
**State:**
```javascript
{
  employees: [],           // All employees from API
  filteredEmployees: [],   // Filtered/searched employees
  selectedEmployee: null,  // Employee being edited
  isFormOpen: false,       // Form modal state
  searchTerm: '',         // Search input value
  selectedDepartment: '', // Department filter value
  loading: false,         // Loading state
  error: null            // Error message
}
```

**Responsibilities:**
- Fetch employee data
- Apply search/filter
- Coordinate child components
- Handle CRUD operations

---

#### `frontend/src/components/EmployeeFilter/EmployeeFilter.jsx`
**Purpose:** Search and filter controls  
**Features:**
- Search input (debounced)
- Department dropdown
- Clear filters button

**Props:**
```javascript
{
  searchTerm: string,
  selectedDepartment: string,
  departments: string[],
  onSearchChange: (term) => void,
  onDepartmentChange: (dept) => void,
  onClearFilters: () => void
}
```

---

#### `frontend/src/components/EmployeeList/EmployeeList.jsx`
**Purpose:** Display employee cards  
**Features:**
- Grid layout
- Loading spinner
- Empty state
- Error state

**Props:**
```javascript
{
  employees: Employee[],
  loading: boolean,
  error: string | null,
  onEdit: (employee) => void,
  onDelete: (id) => void
}
```

---

#### `frontend/src/components/EmployeeCard/EmployeeCard.jsx`
**Purpose:** Individual employee card  
**Displays:**
- Name
- Email
- Department
- Role
- Hire date

**Actions:**
- Edit button
- Delete button (with confirmation)

---

#### `frontend/src/components/EmployeeForm/EmployeeForm.jsx`
**Purpose:** Add/Edit employee form  
**Features:**
- Modal dialog
- Form validation
- Create/Update modes
- Loading state during submission

**Fields:**
- Name (required)
- Email (required, valid email)
- Department (required)
- Role (required)
- Hire Date (required, YYYY-MM-DD)

**Validation:**
```javascript
{
  name: 'Name is required',
  email: 'Valid email is required',
  department: 'Department is required',
  role: 'Role is required',
  hire_date: 'Valid date is required (YYYY-MM-DD)'
}
```

---

## Environment Variables

### Backend `.env`
```bash
# Server Configuration
NODE_ENV=development          # development | production
PORT=5000                     # Server port

# Database
DATABASE_PATH=./database/employees.db

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000   # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100   # Max requests per window

# Logging
LOG_LEVEL=info                # error | warn | info | debug
```

### Frontend `.env`
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Environment
REACT_APP_ENV=development     # development | production
```

---

## Package Scripts

### Backend Scripts
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "format": "prettier --write \"src/**/*.js\""
  }
}
```

### Frontend Scripts
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false",
    "eject": "react-scripts eject",
    "lint": "eslint src/**/*.{js,jsx}",
    "lint:fix": "eslint src/**/*.{js,jsx} --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,css}\""
  }
}
```

### Root Scripts
```json
{
  "scripts": {
    "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm start",
    "test:all": "npm run test:backend && npm run test:frontend",
    "test:backend": "cd backend && npm test",
    "test:frontend": "cd frontend && npm test -- --watchAll=false",
    "build": "cd frontend && npm run build",
    "lint:all": "npm run lint:backend && npm run lint:frontend",
    "lint:backend": "cd backend && npm run lint",
    "lint:frontend": "cd frontend && npm run lint"
  }
}
```

---

## Common Development Commands

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd employee-management-app

# Install all dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Initialize database (automatic on first run)
cd backend && npm run dev
```

### Development
```bash
# Run both backend and frontend
npm run dev

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend

# Run tests
npm run test:all

# Run backend tests with coverage
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

### Production Build
```bash
# Build frontend
npm run build

# Start backend in production
cd backend
NODE_ENV=production npm start
```

---

## API Testing Examples

### Using curl
```bash
# Get all employees
curl http://localhost:5000/api/employees

# Search employees
curl "http://localhost:5000/api/employees?search=john"

# Filter by department
curl "http://localhost:5000/api/employees?department=Engineering"

# Get single employee
curl http://localhost:5000/api/employees/1

# Create employee
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "department": "Engineering",
    "role": "Developer",
    "hire_date": "2022-01-15"
  }'

# Update employee
curl -X PUT http://localhost:5000/api/employees/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "email": "john.updated@example.com",
    "department": "Engineering",
    "role": "Senior Developer",
    "hire_date": "2022-01-15"
  }'

# Delete employee
curl -X DELETE http://localhost:5000/api/employees/1
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

#### Database Locked
```bash
# Stop all running instances
# Delete database file
rm backend/database/employees.db

# Restart application (will recreate database)
npm run dev:backend
```

#### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf backend/node_modules frontend/node_modules node_modules
npm run install:all
```

#### Test Failures
```bash
# Clear Jest cache
cd backend && npx jest --clearCache
cd frontend && npx jest --clearCache

# Run tests again
npm run test:all
```

---

## File Naming Conventions

### Backend
- Files: `camelCase.js` (e.g., `employeeController.js`)
- Classes: `PascalCase` (e.g., `class EmployeeModel`)
- Functions: `camelCase` (e.g., `async function getEmployee()`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `const MAX_REQUESTS = 100`)

### Frontend
- Components: `PascalCase.jsx` (e.g., `EmployeeCard.jsx`)
- Hooks: `camelCase.js` starting with `use` (e.g., `useEmployees.js`)
- Utilities: `camelCase.js` (e.g., `validators.js`)
- Styles: `ComponentName.module.css` (e.g., `EmployeeCard.module.css`)
- Tests: `ComponentName.test.jsx` (e.g., `EmployeeCard.test.jsx`)

---

## Git Workflow

### Branch Naming
- Feature: `feature/description` (e.g., `feature/employee-search`)
- Bug Fix: `fix/description` (e.g., `fix/email-validation`)
- Hotfix: `hotfix/description` (e.g., `hotfix/rate-limit`)

### Commit Messages
```
type(scope): description

[optional body]

[optional footer]
```

**Types:** feat, fix, docs, style, refactor, test, chore

**Examples:**
```
feat(backend): add employee search functionality
fix(frontend): correct date validation in form
docs(api): update API endpoint documentation
test(backend): add rate limiting integration tests
```

---

## Additional Resources

- [DESIGN.md](./DESIGN.md) - Complete technical design document
- [README.md](./README.md) - Project overview
- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`

---

**Last Updated:** 2024-02-12  
**Version:** 1.0
