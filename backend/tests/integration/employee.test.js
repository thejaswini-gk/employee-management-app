const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/database');

describe('Employee API Integration Tests', () => {
  beforeEach((done) => {
    // Clear database before each test
    db.run('DELETE FROM employees', () => {
      done();
    });
  });

  afterAll((done) => {
    db.close(done);
  });

  describe('POST /api/employees', () => {
    it('should create a new employee', async () => {
      const newEmployee = {
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        role: 'Software Engineer',
        hire_date: '2024-01-15',
      };

      const response = await request(app)
        .post('/api/employees')
        .send(newEmployee)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
      });
      expect(response.body.data.id).toBeDefined();
    });

    it('should return 400 for invalid employee data', async () => {
      const invalidEmployee = {
        name: '',
        email: 'invalid-email',
        department: 'Engineering',
      };

      const response = await request(app)
        .post('/api/employees')
        .send(invalidEmployee)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should return 409 for duplicate email', async () => {
      const employee = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        department: 'HR',
        role: 'HR Manager',
        hire_date: '2024-02-01',
      };

      await request(app).post('/api/employees').send(employee);
      
      const response = await request(app)
        .post('/api/employees')
        .send(employee)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/employees', () => {
    beforeEach(async () => {
      // Insert test data
      const employees = [
        { name: 'Alice Smith', email: 'alice@example.com', department: 'Engineering', role: 'Developer', hire_date: '2024-01-01' },
        { name: 'Bob Johnson', email: 'bob@example.com', department: 'Marketing', role: 'Manager', hire_date: '2024-01-15' },
        { name: 'Charlie Brown', email: 'charlie@example.com', department: 'Engineering', role: 'Senior Developer', hire_date: '2024-02-01' },
      ];

      for (const emp of employees) {
        await request(app).post('/api/employees').send(emp);
      }
    });

    it('should get all employees', async () => {
      const response = await request(app)
        .get('/api/employees')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
      expect(response.body.data).toHaveLength(3);
    });

    it('should search employees by name', async () => {
      const response = await request(app)
        .get('/api/employees?search=alice')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].name).toBe('Alice Smith');
    });

    it('should search employees by partial name (case-insensitive)', async () => {
      const response = await request(app)
        .get('/api/employees?search=SMITH')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].name).toBe('Alice Smith');
    });

    it('should filter employees by department', async () => {
      const response = await request(app)
        .get('/api/employees?department=Engineering')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.every(emp => emp.department === 'Engineering')).toBe(true);
    });

    it('should filter by department (case-insensitive)', async () => {
      const response = await request(app)
        .get('/api/employees?department=engineering')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
    });

    it('should combine search and filter', async () => {
      const response = await request(app)
        .get('/api/employees?search=Brown&department=Engineering')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].name).toBe('Charlie Brown');
    });

    it('should return empty array when no matches', async () => {
      const response = await request(app)
        .get('/api/employees?search=NonExistent')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/employees/:id', () => {
    it('should get employee by id', async () => {
      const employee = {
        name: 'Test User',
        email: 'test@example.com',
        department: 'IT',
        role: 'Tester',
        hire_date: '2024-03-01',
      };

      const createResponse = await request(app).post('/api/employees').send(employee);
      const id = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/employees/${id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(id);
      expect(response.body.data.name).toBe('Test User');
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await request(app)
        .get('/api/employees/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/employees/:id', () => {
    it('should update employee', async () => {
      const employee = {
        name: 'Original Name',
        email: 'original@example.com',
        department: 'Sales',
        role: 'Sales Rep',
        hire_date: '2024-01-01',
      };

      const createResponse = await request(app).post('/api/employees').send(employee);
      const id = createResponse.body.data.id;

      const updatedData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        department: 'Marketing',
        role: 'Marketing Manager',
        hire_date: '2024-01-01',
      };

      const response = await request(app)
        .put(`/api/employees/${id}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });

    it('should return 404 for non-existent employee', async () => {
      const updatedData = {
        name: 'Test',
        email: 'test@example.com',
        department: 'IT',
        role: 'Developer',
        hire_date: '2024-01-01',
      };

      const response = await request(app)
        .put('/api/employees/99999')
        .send(updatedData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/employees/:id', () => {
    it('should delete employee', async () => {
      const employee = {
        name: 'To Delete',
        email: 'delete@example.com',
        department: 'IT',
        role: 'Temp',
        hire_date: '2024-01-01',
      };

      const createResponse = await request(app).post('/api/employees').send(employee);
      const id = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/employees/${id}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      await request(app).get(`/api/employees/${id}`).expect(404);
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await request(app)
        .delete('/api/employees/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/employees/departments', () => {
    beforeEach(async () => {
      const employees = [
        { name: 'Emp1', email: 'emp1@example.com', department: 'Engineering', role: 'Dev', hire_date: '2024-01-01' },
        { name: 'Emp2', email: 'emp2@example.com', department: 'Marketing', role: 'Manager', hire_date: '2024-01-01' },
        { name: 'Emp3', email: 'emp3@example.com', department: 'Engineering', role: 'Dev', hire_date: '2024-01-01' },
      ];

      for (const emp of employees) {
        await request(app).post('/api/employees').send(emp);
      }
    });

    it('should get unique departments', async () => {
      const response = await request(app)
        .get('/api/employees/departments')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(['Engineering', 'Marketing']);
    });
  });
});
