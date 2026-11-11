import { useEffect, useState } from 'react';
import axios from 'axios';
import { Employee } from './types';
import EmployeeForm from './components/EmployeeForm';
import EmployeeTable from './components/EmployeeTable';

const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/employees'
    : 'https://employee-crud-app-server-production.up.railway.app/employees');
const PAGE_SIZE = 5;

// Initial 10 employees (matching MySQL schema.sql) used for GitHub Pages demo mode
const DEFAULT_EMPLOYEES: Employee[] = [
  { id: 10, name: 'Smith Roy', email: 'smith.roy@example.com', role: 'Designer', created_at: '2026-11-11 11:31:15' },
  { id: 9, name: 'Vandana Kumari', email: 'vandana.kumari@example.com', role: 'Designer', created_at: '2026-11-11 11:31:15' },
  { id: 8, name: 'Sakshi Mishra', email: 'sakshi.mishra@example.com', role: 'Analayst', created_at: '2026-11-11 11:31:15' },
  { id: 7, name: 'Akhil Singh', email: 'akhil.singh@example.com', role: 'Full Stack Developer', created_at: '2026-11-11 11:31:15' },
  { id: 6, name: 'Komal Verma', email: 'komal.verma@example.com', role: 'HR Manager', created_at: '2026-11-11 11:28:04' },
  { id: 5, name: 'Neha Singh', email: 'neha.singh@example.com', role: 'UI/UX Designer', created_at: '2026-11-11 11:28:04' },
  { id: 4, name: 'Sunny Raut', email: 'sunny.raut@example.com', role: 'Unity Developer', created_at: '2026-11-11 11:28:04' },
  { id: 3, name: 'Rohan Verma', email: 'rohan.verma@example.com', role: 'Manager', created_at: '2026-11-11 11:23:28' },
  { id: 2, name: 'Priya Patel', email: 'priya.patel@example.com', role: 'Designer', created_at: '2026-11-11 11:23:28' },
  { id: 1, name: 'Aarav Sharma', email: 'aarav.sharma@example.com', role: 'Developer', created_at: '2026-11-11 11:23:28' },
];

const STORAGE_KEY = 'employee_records';

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // temporary flash feedback message
  const flashSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  // load employees: calls backend if local, falls back to localStorage on GitHub Pages
  const loadEmployees = async () => {
    setLoading(true);
    setError('');

    if (API_URL) {
      try {
        const res = await axios.get<Employee[]>(API_URL, {
          params: search.trim() ? { search: search.trim() } : {},
        });
        setEmployees(res.data);
        setIsDemoMode(false);
        setLoading(false);
        return;
      } catch (err) {
        console.warn('API endpoint unreachable, falling back to local storage');
      }
    }

    // GitHub Pages / demo mode using localStorage to persist data
    setIsDemoMode(true);
    let stored = localStorage.getItem(STORAGE_KEY);
    let list: Employee[] = stored ? JSON.parse(stored) : DEFAULT_EMPLOYEES;

    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q)
      );
    }

    setEmployees(list);
    setLoading(false);
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
    if (!isDemoMode) {
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
    }

    // save to localStorage in demo mode
    const stored = localStorage.getItem(STORAGE_KEY);
    let list: Employee[] = stored ? JSON.parse(stored) : [...DEFAULT_EMPLOYEES];

    // check duplicate email
    const duplicate = list.some(
      (e) => e.email.toLowerCase() === formData.email.trim().toLowerCase() && e.id !== editingEmployee?.id
    );
    if (duplicate) {
      return { email: 'Email is already registered' };
    }

    if (editingEmployee?.id) {
      list = list.map((e) =>
        e.id === editingEmployee.id
          ? { ...e, name: formData.name.trim(), email: formData.email.trim(), role: formData.role.trim() }
          : e
      );
      flashSuccess(`Updated "${formData.name}" (saved in browser)!`);
    } else {
      const nextId = list.reduce((max, e) => Math.max(max, e.id || 0), 0) + 1;
      const newEmp: Employee = {
        id: nextId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role.trim(),
        created_at: new Date().toISOString(),
      };
      list = [newEmp, ...list];
      flashSuccess(`Added "${formData.name}" (saved in browser)!`);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setEditingEmployee(null);
    loadEmployees();
    return null;
  };

  // delete employee with confirmation
  const handleDelete = async (employee: Employee) => {
    if (!window.confirm(`Are you sure you want to delete ${employee.name}?`)) return;

    if (!isDemoMode) {
      try {
        await axios.delete(`${API_URL}/${employee.id}`);
        flashSuccess(`Deleted ${employee.name}.`);
        if (editingEmployee?.id === employee.id) setEditingEmployee(null);

        if (paginatedEmployees.length === 1 && page > 1) {
          setPage((p) => p - 1);
        }
        loadEmployees();
        return;
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to delete employee');
        return;
      }
    }

    // delete from localStorage in demo mode
    const stored = localStorage.getItem(STORAGE_KEY);
    let list: Employee[] = stored ? JSON.parse(stored) : [...DEFAULT_EMPLOYEES];
    list = list.filter((e) => e.id !== employee.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

    flashSuccess(`Deleted ${employee.name} (saved in browser).`);
    if (editingEmployee?.id === employee.id) setEditingEmployee(null);

    if (paginatedEmployees.length === 1 && page > 1) {
      setPage((p) => p - 1);
    }
    loadEmployees();
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
            <p className="subtitle">
              Manage team members, roles, and contacts
              {isDemoMode && <span className="demo-tag">Live Demo Mode (Saved locally)</span>}
            </p>
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
