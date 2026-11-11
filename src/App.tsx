import { useEffect, useState } from 'react';
import axios from 'axios';
import { Employee } from './types';
import EmployeeForm from './components/EmployeeForm';
import EmployeeTable from './components/EmployeeTable';

const API_URL = 'http://localhost:5000/employees';
const PAGE_SIZE = 5;

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // temporary flash feedback message
  const flashSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  // fetch employees from backend using axios
  const loadEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get<Employee[]>(API_URL, {
        params: search.trim() ? { search: search.trim() } : {},
      });
      setEmployees(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not load employees. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees();
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // add or update employee
  const handleSave = async (formData: { name: string; email: string; role: string }) => {
    try {
      if (editingEmployee?.id) {
        await axios.put(`${API_URL}/${editingEmployee.id}`, formData);
        flashSuccess(`Updated "${formData.name}" successfully!`);
      } else {
        await axios.post(API_URL, formData);
        flashSuccess(`Added "${formData.name}" to the directory!`);
      }
      setEditingEmployee(null);
      loadEmployees();
      return null;
    } catch (err: any) {
      return err.response?.data?.errors || err.response?.data?.error || 'Failed to save';
    }
  };

  // delete employee with confirmation
  const handleDelete = async (employee: Employee) => {
    if (!window.confirm(`Are you sure you want to delete ${employee.name}?`)) return;

    try {
      await axios.delete(`${API_URL}/${employee.id}`);
      flashSuccess(`Deleted ${employee.name}.`);
      if (editingEmployee?.id === employee.id) setEditingEmployee(null);

      // move back one page if last item on page was deleted
      if (paginatedEmployees.length === 1 && page > 1) {
        setPage((p) => p - 1);
      }
      loadEmployees();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete employee');
    }
  };

  // pagination
  const totalPages = Math.ceil(employees.length / PAGE_SIZE) || 1;
  const paginatedEmployees = employees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="container">
      {/* Top Header */}
      <header className="header">
        <div className="header-title-row">
          <div className="brand-badge">ED</div>
          <div>
            <h1>Employee Directory</h1>
            <p className="subtitle">Manage team members, roles, and contacts</p>
          </div>
        </div>
        <div className="header-stat">
          <span className="stat-num">{employees.length}</span>
          <span className="stat-text">Total Employees</span>
        </div>
      </header>

      {/* Success Banner */}
      {success && <div className="toast-success">{success}</div>}

      <div className="layout">
        {/* Sidebar: Form */}
        <aside className="sidebar">
          <EmployeeForm
            employee={editingEmployee}
            onSave={handleSave}
            onCancel={() => setEditingEmployee(null)}
          />
        </aside>

        {/* Main Content: Table + Search + Pagination */}
        <section className="main-content">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setSearch('')}
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          {error && <div className="alert">{error}</div>}

          {loading ? (
            <div className="loading-box">
              <div className="spinner"></div>
              <p>Loading directory...</p>
            </div>
          ) : (
            <>
              <EmployeeTable
                employees={paginatedEmployees}
                onEdit={setEditingEmployee}
                onDelete={handleDelete}
              />

              {totalPages > 1 && (
                <div className="pagination">
                  <span className="page-info">
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, employees.length)} of {employees.length}
                  </span>
                  <div className="page-controls">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="btn-page"
                    >
                      &larr; Prev
                    </button>
                    <span className="page-current">
                      {page} / {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="btn-page"
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
