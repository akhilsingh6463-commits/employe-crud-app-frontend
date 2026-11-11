import { useState, useEffect } from 'react';
import { Employee } from '../types';

interface Props {
  employee: Employee | null;
  onSave: (data: { name: string; email: string; role: string }) => Promise<any>;
  onCancel: () => void;
}

const emptyForm = { name: '', email: '', role: '' };

function EmployeeForm({ employee, onSave, onCancel }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm({ name: employee.name, email: employee.email, role: employee.role });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!form.email.includes('@')) {
      errs.email = 'Enter a valid email address';
    }
    if (!form.role.trim()) errs.role = 'Job role is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const err = await onSave(form);
    setSaving(false);

    if (err) {
      setErrors(typeof err === 'object' ? err : { form: err });
    } else if (!employee) {
      setForm(emptyForm);
    }
  };

  return (
    <form className="card form sticky-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>{employee ? 'Edit Employee' : 'Add Employee'}</h3>
        {employee && (
          <span className="editing-badge">Editing #{employee.id}</span>
        )}
      </div>

      {errors.form && <div className="alert">{errors.form}</div>}

      <div className="form-group">
        <label htmlFor="emp-name">Full Name *</label>
        <input
          id="emp-name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Aarav Sharma"
          autoComplete="off"
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="emp-email">Email Address *</label>
        <input
          id="emp-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="e.g. aarav.sharma@example.com"
          autoComplete="off"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="emp-role">Job Role *</label>
        <input
          id="emp-role"
          name="role"
          value={form.role}
          onChange={handleChange}
          placeholder="e.g. Full Stack Developer"
          autoComplete="off"
        />
        {errors.role && <span className="error">{errors.role}</span>}
      </div>

      <div className="actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : employee ? 'Update Employee' : 'Add Employee'}
        </button>
        {employee && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default EmployeeForm;
