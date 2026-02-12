# Employee Management System - API Reference

A quick reference guide for the Employee Management System REST API.

**Base URL:** `http://localhost:5000/api`

---

## Table of Contents
1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
3. [Data Models](#data-models)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)

---

## Authentication

**Current Version:** No authentication required (v1.0)

**Future Versions:** Will implement JWT-based authentication

---

## Endpoints

### 1. Get All Employees

Retrieve a list of all employees with optional search and filter.

```http
GET /api/employees
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search employees by name (case-insensitive, partial match) |
| department | string | No | Filter employees by exact department name |

#### Success Response (200 OK)

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
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "department": "HR",
      "role": "HR Manager",
      "hire_date": "2021-06-20"
    }
  ],
  "count": 2
}
```

#### Example Requests

```bash
# Get all employees
curl http://localhost:5000/api/employees

# Search by name
curl "http://localhost:5000/api/employees?search=john"

# Filter by department
curl "http://localhost:5000/api/employees?department=Engineering"

# Combine search and filter
curl "http://localhost:5000/api/employees?search=john&department=Engineering"
```

---

### 2. Get Single Employee

Retrieve a specific employee by ID.

```http
GET /api/employees/:id
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Employee ID |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "department": "Engineering",
    "role": "Senior Developer",
    "hire_date": "2022-01-15"
  }
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "error": "Employee not found"
}
```

#### Example Request

```bash
curl http://localhost:5000/api/employees/1
```

---

### 3. Create Employee

Create a new employee record.

```http
POST /api/employees
```

#### Request Headers

```
Content-Type: application/json
```

#### Request Body

```json
{
  "name": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "department": "Sales",
  "role": "Sales Representative",
  "hire_date": "2024-01-10"
}
```

#### Field Validations

| Field | Type | Validations |
|-------|------|-------------|
| name | string | Required, non-empty, trimmed |
| email | string | Required, valid email format, unique, normalized |
| department | string | Required, non-empty, trimmed |
| role | string | Required, non-empty, trimmed |
| hire_date | string | Required, format: YYYY-MM-DD, valid date |

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "department": "Sales",
    "role": "Sales Representative",
    "hire_date": "2024-01-10"
  },
  "message": "Employee created successfully"
}
```

#### Error Response (400 Bad Request)

```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    },
    {
      "field": "hire_date",
      "message": "Invalid date format. Use YYYY-MM-DD"
    }
  ]
}
```

#### Example Request

```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "department": "Sales",
    "role": "Sales Representative",
    "hire_date": "2024-01-10"
  }'
```

---

### 4. Update Employee

Update an existing employee record.

```http
PUT /api/employees/:id
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Employee ID to update |

#### Request Headers

```
Content-Type: application/json
```

#### Request Body

All fields are required (full update):

```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "department": "Engineering",
  "role": "Lead Developer",
  "hire_date": "2022-01-15"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe Updated",
    "email": "john.updated@example.com",
    "department": "Engineering",
    "role": "Lead Developer",
    "hire_date": "2022-01-15"
  },
  "message": "Employee updated successfully"
}
```

#### Error Responses

**404 Not Found:**
```json
{
  "success": false,
  "error": "Employee not found"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

#### Example Request

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

### 5. Delete Employee

Delete an employee record.

```http
DELETE /api/employees/:id
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Employee ID to delete |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "error": "Employee not found"
}
```

#### Example Request

```bash
curl -X DELETE http://localhost:5000/api/employees/1
```

---

## Data Models

### Employee

```typescript
interface Employee {
  id: number;              // Auto-increment, primary key
  name: string;            // Employee full name
  email: string;           // Unique email address
  department: string;      // Department name
  role: string;            // Job role/title
  hire_date: string;       // Date in YYYY-MM-DD format
  created_at?: string;     // ISO 8601 timestamp (read-only)
  updated_at?: string;     // ISO 8601 timestamp (read-only)
}
```

### Response Wrapper

All successful responses follow this format:

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  count?: number;          // For list endpoints
}
```

### Error Response

All error responses follow this format:

```typescript
interface ErrorResponse {
  success: false;
  error?: string;          // General error message
  errors?: Array<{         // Validation errors
    field: string;
    message: string;
  }>;
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation errors, invalid input |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Error Scenarios

#### 1. Validation Errors (400)

**Scenario:** Invalid input data

**Response:**
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "hire_date",
      "message": "Invalid date format. Use YYYY-MM-DD"
    }
  ]
}
```

#### 2. Duplicate Email (400)

**Scenario:** Email already exists in database

**Response:**
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

#### 3. Employee Not Found (404)

**Scenario:** Requested employee ID doesn't exist

**Response:**
```json
{
  "success": false,
  "error": "Employee not found"
}
```

#### 4. Rate Limit Exceeded (429)

**Scenario:** Client exceeded 100 requests in 15 minutes

**Response:**
```json
{
  "success": false,
  "error": "Too many requests, please try again later."
}
```

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1707741600
Retry-After: 900
```

#### 5. Server Error (500)

**Scenario:** Unexpected server error

**Response:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

**Note:** Detailed error messages are logged server-side but not exposed to clients in production.

---

## Rate Limiting

### Configuration

- **Window:** 15 minutes (900 seconds)
- **Max Requests:** 100 per IP address
- **Scope:** Per IP address, applies to all endpoints
- **Headers:** Includes standard rate limit headers

### Rate Limit Headers

Every response includes these headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1707741600
```

| Header | Description |
|--------|-------------|
| X-RateLimit-Limit | Maximum requests allowed in window |
| X-RateLimit-Remaining | Requests remaining in current window |
| X-RateLimit-Reset | Unix timestamp when window resets |

### Handling Rate Limits

When rate limit is exceeded:

**Status Code:** 429 Too Many Requests

**Response:**
```json
{
  "success": false,
  "error": "Too many requests, please try again later."
}
```

**Headers:**
```http
Retry-After: 900
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1707741600
```

**Client Implementation:**
```javascript
async function makeRequest() {
  try {
    const response = await axios.get('/api/employees');
    return response.data;
  } catch (error) {
    if (error.response.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      console.log(`Rate limited. Retry after ${retryAfter} seconds`);
      
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return makeRequest();
    }
    throw error;
  }
}
```

---

## Search and Filter Examples

### Search by Name

**Case-insensitive, partial match:**

```bash
# Find all employees with "john" in their name
curl "http://localhost:5000/api/employees?search=john"

# Matches: "John Doe", "Johnny Smith", "john.doe@example.com"
```

**Implementation:** Uses SQL `LIKE` with `COLLATE NOCASE`

### Filter by Department

**Exact match, case-sensitive:**

```bash
# Find all employees in Engineering department
curl "http://localhost:5000/api/employees?department=Engineering"

# Note: "engineering" won't match "Engineering"
```

### Combined Search and Filter

**Both filters applied (AND logic):**

```bash
# Find employees named "john" in Engineering
curl "http://localhost:5000/api/employees?search=john&department=Engineering"

# Result: Only employees matching BOTH criteria
```

---

## Postman Collection

### Import into Postman

1. Create new collection: "Employee Management API"
2. Add environment variables:
   - `base_url`: `http://localhost:5000/api`
3. Import endpoints from this specification

### Environment Variables

```json
{
  "base_url": "http://localhost:5000/api",
  "employee_id": "1"
}
```

### Sample Requests

```json
{
  "info": {
    "name": "Employee Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Employees",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/employees"
      }
    },
    {
      "name": "Search Employees",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/employees?search=john",
          "query": [
            {
              "key": "search",
              "value": "john"
            }
          ]
        }
      }
    }
  ]
}
```

---

## Testing the API

### Using curl

```bash
# Test GET all
curl -i http://localhost:5000/api/employees

# Test GET by ID
curl -i http://localhost:5000/api/employees/1

# Test POST (create)
curl -i -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "department": "IT",
    "role": "Tester",
    "hire_date": "2024-01-01"
  }'

# Test PUT (update)
curl -i -X PUT http://localhost:5000/api/employees/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated User",
    "email": "updated@example.com",
    "department": "IT",
    "role": "Senior Tester",
    "hire_date": "2024-01-01"
  }'

# Test DELETE
curl -i -X DELETE http://localhost:5000/api/employees/1
```

### Using JavaScript (Axios)

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Get all employees
const getEmployees = async () => {
  const response = await axios.get(`${API_BASE}/employees`);
  return response.data;
};

// Search employees
const searchEmployees = async (searchTerm) => {
  const response = await axios.get(`${API_BASE}/employees`, {
    params: { search: searchTerm }
  });
  return response.data;
};

// Create employee
const createEmployee = async (employee) => {
  const response = await axios.post(`${API_BASE}/employees`, employee);
  return response.data;
};

// Update employee
const updateEmployee = async (id, employee) => {
  const response = await axios.put(`${API_BASE}/employees/${id}`, employee);
  return response.data;
};

// Delete employee
const deleteEmployee = async (id) => {
  const response = await axios.delete(`${API_BASE}/employees/${id}`);
  return response.data;
};
```

---

## Best Practices

### 1. Error Handling

Always check the `success` field:

```javascript
const response = await fetch('/api/employees');
const data = await response.json();

if (data.success) {
  // Handle success
  console.log(data.data);
} else {
  // Handle error
  console.error(data.error || data.errors);
}
```

### 2. Rate Limit Management

Monitor rate limit headers and implement backoff:

```javascript
function checkRateLimit(headers) {
  const remaining = parseInt(headers['x-ratelimit-remaining']);
  const reset = parseInt(headers['x-ratelimit-reset']);
  
  if (remaining < 10) {
    console.warn(`Only ${remaining} requests remaining`);
  }
  
  if (remaining === 0) {
    const waitTime = (reset * 1000) - Date.now();
    console.log(`Rate limited. Wait ${waitTime}ms`);
  }
}
```

### 3. Input Validation

Validate data client-side before sending:

```javascript
function validateEmployee(employee) {
  const errors = [];
  
  if (!employee.name || employee.name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required' });
  }
  
  if (!employee.email || !isValidEmail(employee.email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }
  
  if (!employee.hire_date || !isValidDate(employee.hire_date)) {
    errors.push({ field: 'hire_date', message: 'Valid date is required (YYYY-MM-DD)' });
  }
  
  return errors;
}
```

### 4. Retry Logic

Implement exponential backoff for failed requests:

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        await new Promise(r => setTimeout(r, retryAfter * 1000));
        continue;
      }
      
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}
```

---

## Changelog

### v1.0.0 (2024-02-12)
- Initial API release
- CRUD operations for employees
- Search by name
- Filter by department
- Rate limiting (100 req/15min)
- Input validation
- Error handling

---

## Support

For API issues or questions:
- GitHub Issues: https://github.com/yourusername/employee-management-app/issues
- Email: api-support@example.com

---

**API Version:** 1.0.0  
**Last Updated:** 2024-02-12
