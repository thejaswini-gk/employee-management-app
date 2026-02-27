export default function EmployeeFilter({ selectedDepartment, onFilterChange }) {
  return (
    <div className="filter-container">
      <label htmlFor="department-filter">Filter by Department:</label>
      <select
        id="department-filter"
        value={selectedDepartment}
        onChange={(e) => onFilterChange(e.target.value)}
      >
        <option value="">All Departments</option>
        <option value="Engineering">Engineering</option>
        <option value="Human Resources">Human Resources</option>
        <option value="Sales">Sales</option>
        <option value="Marketing">Marketing</option>
        <option value="Finance">Finance</option>
        <option value="Operations">Operations</option>
      </select>
    </div>
  );
}
