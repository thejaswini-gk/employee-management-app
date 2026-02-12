# Employee Management System

A full-stack Employee Management System with CRUD operations, search/filter functionality, and a modern user interface.

## Features

- ✅ Create, Read, Update, Delete (CRUD) operations for employee records
- ✅ Employee fields: ID, Name, Email, Department, Role, Hire Date
- ✅ Search and filter employees by department
- ✅ RESTful API design
- ✅ Clean, maintainable code with proper error handling
- ✅ Input validation on both frontend and backend
- ✅ Responsive design

## Tech Stack

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **SQLite** - Lightweight database for employee records
- **CORS** - Cross-Origin Resource Sharing support

### Frontend
- **React** - UI library
- **Vite** - Fast build tool and development server
- **CSS** - Custom styling with responsive design

## Project Structure

```
employee-management-app/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   └── database.js       # SQLite database setup
│   │   ├── routes/
│   │   │   └── employees.js      # Employee API routes
│   │   └── middleware/
│   │       └── errorHandler.js   # Error handling middleware
│   ├── server.js                 # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmployeeList.jsx  # Employee table display
│   │   │   ├── EmployeeForm.jsx  # Add/Edit form
│   │   │   └── EmployeeFilter.jsx # Department filter
│   │   ├── services/
│   │   │   └── employeeService.js # API client
│   │   ├── App.jsx               # Main application component
│   │   ├── App.css               # Application styles
│   │   └── main.jsx              # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

The backend server will run on `http://localhost:3001`

For development with auto-reload:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

4. Build for production:
```bash
npm run build
```

## API Endpoints

### Base URL: `http://localhost:3001/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees` | Get all employees |
| GET | `/employees?department=<dept>` | Filter employees by department |
| GET | `/employees/:id` | Get employee by ID |
| POST | `/employees` | Create new employee |
| PUT | `/employees/:id` | Update employee |
| DELETE | `/employees/:id` | Delete employee |
| GET | `/health` | Health check endpoint |

### Request/Response Examples

#### Create Employee
```bash
POST /api/employees
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "department": "Engineering",
  "role": "Software Engineer",
  "hire_date": "2024-01-15"
}
```

#### Response
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "department": "Engineering",
  "role": "Software Engineer",
  "hire_date": "2024-01-15"
}
```

## Database Schema

### Employees Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL, UNIQUE |
| department | TEXT | NOT NULL |
| role | TEXT | NOT NULL |
| hire_date | TEXT | NOT NULL (YYYY-MM-DD format) |

## Available Departments
- Engineering
- Human Resources
- Sales
- Marketing
- Finance
- Operations

## Error Handling

The application includes comprehensive error handling:
- Input validation (email format, required fields, date format)
- Unique email constraint enforcement
- 404 handling for non-existent employees
- 500 error handling for server errors
- User-friendly error messages in the UI

## Features in Detail

### Create Employee
- Form validation for all required fields
- Email format validation
- Date picker for hire date
- Real-time error feedback

### Update Employee
- Pre-populated form with existing data
- Same validation as create
- Immediate UI update after successful save

### Delete Employee
- Confirmation dialog before deletion
- Immediate UI update after deletion

### Filter by Department
- Dropdown to select department
- Real-time filtering
- Shows all employees when "All Departments" is selected

## Development Notes

- The SQLite database file (`employees.db`) is created automatically in the root directory
- Backend runs on port 3001, frontend on port 3000
- Frontend proxies API requests to backend via Vite configuration
- CORS is enabled for cross-origin requests

## License

MIT
