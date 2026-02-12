export default function EmployeeList({ employees, onEdit, onDelete }) {
  if (employees.length === 0) {
    return <p className="no-data">No employees found</p>;
  }

  return (
    <div className="employee-list">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Role</th>
            <th>Hire Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.name}</td>
              <td>{employee.email}</td>
              <td>{employee.department}</td>
              <td>{employee.role}</td>
              <td>{new Date(employee.hire_date).toLocaleDateString()}</td>
              <td className="actions">
                <button
                  className="btn btn-sm btn-edit"
                  onClick={() => onEdit(employee)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-delete"
                  onClick={() => onDelete(employee.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
