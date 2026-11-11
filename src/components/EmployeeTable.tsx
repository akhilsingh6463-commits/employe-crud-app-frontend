import { Employee } from '../types';

interface Props {
  employees: Employee[];
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
}

// helper for role badge color
function getRoleClass(role: string): string {
  const r = role.toLowerCase();
  if (r.includes('dev') || r.includes('engineer')) return 'badge-dev';
  if (r.includes('design') || r.includes('ui') || r.includes('ux')) return 'badge-design';
  if (r.includes('manager') || r.includes('lead') || r.includes('hr')) return 'badge-lead';
  if (r.includes('analyst') || r.includes('qa') || r.includes('test')) return 'badge-analyst';
  return 'badge-default';
}

// helper for initials avatar
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

function EmployeeTable({ employees, onEdit, onDelete }: Props) {
  if (employees.length === 0) {
    return (
      <div className="empty-message">
        <p className="empty-title">No employees found</p>
        <p className="empty-sub">Try searching with another name or add a new team member.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Email</th>
            <th>Role</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>
                <div className="user-cell">
                  <span className="avatar">{getInitials(emp.name)}</span>
                  <span className="user-name">{emp.name}</span>
                </div>
              </td>
              <td>
                <a href={`mailto:${emp.email}`} className="email-link">
                  {emp.email}
                </a>
              </td>
              <td>
                <span className={`badge ${getRoleClass(emp.role)}`}>
                  {emp.role}
                </span>
              </td>
              <td className="text-right">
                <div className="row-actions">
                  <button
                    className="btn-sm btn-edit"
                    onClick={() => onEdit(emp)}
                    title="Edit employee"
                  >
                    Edit
                  </button>
                  <button
                    className="btn-sm btn-danger"
                    onClick={() => onDelete(emp)}
                    title="Delete employee"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTable;
