# Employee Management System

A full-stack employee management application with CRUD operations, search, and filtering capabilities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The Employee Management System is a modern web application designed to streamline employee record management. It provides a clean, intuitive interface for HR teams to manage employee data efficiently.

### Key Highlights

- **Full CRUD Operations**: Create, read, update, and delete employee records
- **Advanced Search**: Real-time search by employee name
- **Smart Filtering**: Filter employees by department
- **Rate Limited API**: Protection against abuse with 100 requests per 15 minutes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Comprehensive Testing**: 80%+ test coverage on both frontend and backend

---

## ✨ Features

### Employee Management
- ✅ Add new employees with complete details
- ✅ View all employees in a card-based layout
- ✅ Edit existing employee information
- ✅ Delete employees with confirmation
- ✅ Unique email validation

### Search & Filter
- 🔍 Search employees by name (case-insensitive)
- 🏢 Filter by department
- 🔄 Combine search and filter for precise results
- ⚡ Real-time updates

### Security & Performance
- 🛡️ Rate limiting (100 requests/15 minutes)
- ✔️ Input validation and sanitization
- 🔒 SQL injection prevention
- 🚀 Optimized database queries with indexes
- 📊 Error handling and logging

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18.x LTS
- **Framework**: Express.js 4.18
- **Database**: SQLite 3
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit
- **Testing**: Jest, Supertest

### Frontend
- **Library**: React 18.2
- **HTTP Client**: Axios
- **Styling**: CSS Modules
- **Testing**: React Testing Library, Jest

### Development Tools
- **Linting**: ESLint
- **Formatting**: Prettier
- **Version Control**: Git
- **CI/CD**: GitHub Actions (optional)

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Web Browser   │
└────────┬────────┘
         │ HTTP/HTTPS
         ▼
┌─────────────────┐
│  React Frontend │
│  (Port 3000)    │
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│ Express Backend │
│  (Port 5000)    │
└────────┬────────┘
         │ SQL
         ▼
┌─────────────────┐
│  SQLite DB      │
└─────────────────┘
```

### Data Flow

1. User interacts with React frontend
2. Frontend makes API calls to Express backend
3. Backend validates and processes requests
4. SQLite database stores/retrieves data
5. Response flows back through the stack
6. UI updates with new data

**For detailed architecture, see [DESIGN.md](./DESIGN.md)**

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/employee-management-app.git
   cd employee-management-app
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (backend + frontend)
   npm run install:all
   ```

3. **Configure environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

4. **Start the application**
   ```bash
   # Start both backend and frontend
   npm run dev
   ```

   Or run them separately:
   ```bash
   # Terminal 1: Backend (http://localhost:5000)
   npm run dev:backend
   
   # Terminal 2: Frontend (http://localhost:3000)
   npm run dev:frontend
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Get All Employees
```http
GET /api/employees
```

**Query Parameters:**
- `search` (optional): Search by name
- `department` (optional): Filter by department

**Example:**
```bash
curl "http://localhost:5000/api/employees?search=john&department=Engineering"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "department": "Engineering",
      "role": "Senior Developer",
      "hire_date": "2022-01-15"
    }
  ],
  "count": 1
}
```

---

#### Get Single Employee
```http
GET /api/employees/:id
```

**Example:**
```bash
curl http://localhost:5000/api/employees/1
```

---

#### Create Employee
```http
POST /api/employees
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "department": "HR",
  "role": "HR Manager",
  "hire_date": "2023-03-20"
}
```

**Validation Rules:**
- `name`: Required, non-empty string
- `email`: Required, valid email format, must be unique
- `department`: Required, non-empty string
- `role`: Required, non-empty string
- `hire_date`: Required, format YYYY-MM-DD

**Example:**
```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "department": "HR",
    "role": "HR Manager",
    "hire_date": "2023-03-20"
  }'
```

---

#### Update Employee
```http
PUT /api/employees/:id
```

**Request Body:** Same as create

**Example:**
```bash
curl -X PUT http://localhost:5000/api/employees/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "email": "john.updated@example.com",
    "department": "Engineering",
    "role": "Lead Developer",
    "hire_date": "2022-01-15"
  }'
```

---

#### Delete Employee
```http
DELETE /api/employees/:id
```

**Example:**
```bash
curl -X DELETE http://localhost:5000/api/employees/1
```

---

### Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Employee not found"
}
```

#### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too many requests, please try again later."
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 📁 Project Structure

```
employee-management-app/
├── backend/              # Backend Node.js/Express application
│   ├── src/
│   │   ├── config/       # Database and rate limiter config
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Data access layer
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Utility functions
│   │   ├── app.js        # Express app setup
│   │   └── server.js     # Server entry point
│   ├── tests/            # Backend tests
│   ├── database/         # SQLite database
│   └── package.json
│
├── frontend/             # Frontend React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utility functions
│   │   └── App.jsx       # Root component
│   ├── public/           # Static assets
│   └── package.json
│
├── DESIGN.md             # Technical design document
├── PROJECT_STRUCTURE.md  # Detailed structure guide
└── README.md             # This file
```

**For detailed structure, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**

---

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
cd backend && npm test

# Run with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Watch mode
npm run test:watch
```

**Coverage Target:** > 80%

**Test Types:**
- Unit tests (controllers, models, utilities)
- Integration tests (API endpoints)
- Rate limiting tests

---

### Frontend Tests

```bash
# Run all tests
cd frontend && npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- EmployeeForm.test.jsx
```

**Coverage Target:** > 80%

**Test Types:**
- Component tests
- Hook tests
- Integration tests

---

### Run All Tests

```bash
# From root directory
npm run test:all
```

---

## 🚢 Deployment

### Development

```bash
# Start both backend and frontend
npm run dev
```

### Production Build

1. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start backend in production mode**
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

3. **Serve frontend build**
   - Use a static file server (e.g., Nginx, Apache)
   - Or serve from Express backend

### Docker Deployment (Optional)

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Environment Variables

**Backend (.env)**
```bash
NODE_ENV=production
PORT=5000
DATABASE_PATH=./database/employees.db
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env)**
```bash
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_ENV=production
```

**For detailed deployment guide, see [DESIGN.md - Deployment Strategy](./DESIGN.md#12-deployment-strategy)**

---

## 🎨 Screenshots

### Employee Dashboard
![Dashboard](./docs/screenshots/dashboard.png)

### Add/Edit Employee Form
![Form](./docs/screenshots/form.png)

### Search and Filter
![Search](./docs/screenshots/search.png)

---

## 📊 Performance

- **API Response Time**: < 200ms (p95)
- **Frontend Load Time**: < 2s
- **Database Queries**: Optimized with indexes
- **Rate Limiting**: 100 requests per 15 minutes
- **Test Coverage**: > 80%

---

## 🔒 Security

- ✅ Rate limiting to prevent abuse
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Security headers (helmet)
- ✅ Error message sanitization

---

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Basic CRUD operations
- [x] Search and filter
- [x] Rate limiting
- [x] Comprehensive testing

### Phase 2 (Next)
- [ ] Pagination for large datasets
- [ ] Sorting (by name, hire date, department)
- [ ] Export to CSV/Excel
- [ ] Advanced filters (date range, multiple departments)

### Phase 3 (Future)
- [ ] User authentication
- [ ] Role-based access control
- [ ] Audit logging
- [ ] File upload (employee photos)
- [ ] Dashboard with analytics

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write tests for new features
- Update documentation
- Ensure all tests pass
- Run linter before committing

```bash
# Run linter
npm run lint:all

# Fix linting issues
npm run lint:fix
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Email: support@example.com

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js community
- SQLite for the lightweight database
- All contributors and users

---

## 📚 Documentation

- [Technical Design Document](./DESIGN.md) - Complete system architecture and design
- [Project Structure Guide](./PROJECT_STRUCTURE.md) - Detailed file and folder structure
- [API Documentation](#api-documentation) - REST API reference
- Backend README - `backend/README.md`
- Frontend README - `frontend/README.md`

---

**Built with ❤️ by the Development Team**

**Version:** 1.0.0  
**Last Updated:** 2024-02-12
