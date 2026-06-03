// Add / Edit modal form with validation; includes data-testid attrs
import { useState, useEffect } from 'react';

function IssueModal({ issue, onSave, onClose }) {
  const [form, setForm] = useState({
    issueId: '',
    title: '',
    projectId: '',
    assignedTo: '',
    reportedBy: '',
    priority: 'medium',
    severity: 'minor',
    status: 'open'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (issue) {
      setForm({
        issueId: issue.issueId || '',
        title: issue.title || '',
        projectId: issue.projectId || '',
        assignedTo: issue.assignedTo || '',
        reportedBy: issue.reportedBy || '',
        priority: issue.priority || 'medium',
        severity: issue.severity || 'minor',
        status: issue.status || 'open'
      });
    }
  }, [issue]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.issueId || !form.title || !form.projectId || !form.priority || !form.severity || !form.status) {
      setError('Please fill all required fields');
      return;
    }
    onSave(form);
  };

  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000
  };

  const modalStyle = {
    background: '#fff', padding: '24px', borderRadius: '8px',
    width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'
  };

  const inputStyle = {
    width: '100%', padding: '8px', border: '1px solid #ccc',
    borderRadius: '4px', boxSizing: 'border-box'
  };

  const labelStyle = { display: 'block', marginBottom: '4px', fontWeight: '500' };
  const fieldStyle = { marginBottom: '12px' };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: '16px' }}>{issue ? 'Edit Issue' : 'Add Issue'}</h3>
        {error && <p style={{ color: 'red', marginBottom: '8px' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Issue ID *</label>
            <input name="issueId" value={form.issueId} onChange={handleChange} style={inputStyle} required disabled={!!issue} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Title *</label>
            <input name="title" value={form.title} onChange={handleChange} style={inputStyle} required />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Project ID *</label>
            <input name="projectId" value={form.projectId} onChange={handleChange} style={inputStyle} required />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Assigned To</label>
            <input name="assignedTo" value={form.assignedTo} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Reported By</label>
            <input name="reportedBy" value={form.reportedBy} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Priority *</label>
            <select name="priority" value={form.priority} onChange={handleChange} style={inputStyle} required>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Severity *</label>
            <select name="severity" value={form.severity} onChange={handleChange} style={inputStyle} required>
              <option value="minor">Minor</option>
              <option value="major">Major</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Status *</label>
            <select name="status" value={form.status} onChange={handleChange} style={inputStyle} required>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="testing">Testing</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              data-testid="save-task-btn"
              type="submit"
              style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {issue ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IssueModal;
