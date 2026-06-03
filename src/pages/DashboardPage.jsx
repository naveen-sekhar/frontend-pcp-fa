// Summary cards (total/completed/pending), analytics, task list
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIssues } from '../context/TaskContext';
import { getAllIssues, searchIssues, createIssue, updateIssue, deleteIssue, syncData, getStats, getCurrentUser } from '../services/api';
import IssueModal from '../components/TaskForm';

function DashboardPage() {
  const { items, stats, dispatch } = useIssues();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setCurrentUser(JSON.parse(storedUser)); } catch (e) { /* ignore */ }
    }
    // Also fetch from /auth/me for fresh data
    getCurrentUser().then(res => {
      if (res.data) {
        setCurrentUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    }).catch(() => {});
  }, []);

  const userRole = currentUser?.role || '';
  const isAdminOrManager = ['admin', 'manager'].includes(userRole);
  const isTester = userRole === 'tester';

  const fetchIssues = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const filters = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterPriority) filters.priority = filterPriority;
      const res = await getAllIssues(filters);
      dispatch({ type: 'SET_ITEMS', payload: res.data || [] });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getStats();
      dispatch({ type: 'SET_STATS', payload: res.data || null });
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  useEffect(() => {
    fetchIssues();
    if (isAdminOrManager) fetchStats();
  }, [filterStatus, filterPriority, isAdminOrManager]);

  const handleSearch = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      if (searchQuery.trim()) {
        const res = await searchIssues(searchQuery);
        dispatch({ type: 'SET_ITEMS', payload: res.data || [] });
      } else {
        fetchIssues();
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncData();
      setSyncResult(res);
      fetchIssues();
      if (isAdminOrManager) fetchStats();
    } catch (err) {
      setSyncResult({ success: false, message: err.response?.data?.message || err.message });
    } finally {
      setSyncing(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingIssue) {
        const res = await updateIssue(editingIssue._id, formData);
        dispatch({ type: 'UPDATE_ITEM', payload: res.data });
      } else {
        const res = await createIssue(formData);
        dispatch({ type: 'ADD_ITEM', payload: res.data });
      }
      setShowModal(false);
      setEditingIssue(null);
      if (isAdminOrManager) fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this issue?')) return;
    try {
      await deleteIssue(id);
      dispatch({ type: 'DELETE_ITEM', payload: id });
      if (isAdminOrManager) fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleEdit = (issue) => {
    setEditingIssue(issue);
    setShowModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const containerStyle = { padding: '20px', maxWidth: '1200px', margin: '0 auto' };
  const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
  const statsRowStyle = { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' };
  const statCardStyle = { padding: '16px', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', minWidth: '120px', textAlign: 'center' };
  const controlsStyle = { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' };
  const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' };
  const btnStyle = { padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
  const cardStyle = { padding: '12px', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', marginBottom: '8px' };
  const badgeStyle = (color) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', background: color, color: '#fff', marginRight: '6px' });

  const statusColors = { open: '#e67e22', 'in-progress': '#3498db', testing: '#9b59b6', resolved: '#27ae60', closed: '#95a5a6' };
  const priorityColors = { low: '#95a5a6', medium: '#f39c12', high: '#e74c3c', critical: '#c0392b' };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0 }}>Issue Tracker Dashboard</h2>
          {currentUser && (
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
              Logged in as: {currentUser.name} ({currentUser.role})
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button data-testid="sync-btn" onClick={handleSync} disabled={syncing} style={btnStyle}>
            {syncing ? 'Syncing...' : 'Sync Data'}
          </button>
          <button onClick={handleLogout} style={{ ...btnStyle, background: '#999' }}>Logout</button>
        </div>
      </div>

      {syncResult && (
        <div style={{ padding: '12px', background: syncResult.success ? '#d4edda' : '#f8d7da', borderRadius: '6px', marginBottom: '16px' }}>
          {syncResult.success
            ? `Sync complete - Fetched: ${syncResult.data?.totalFetched}, Inserted: ${syncResult.data?.inserted}, Duplicates: ${syncResult.data?.duplicates}, Rejected: ${syncResult.data?.rejected}`
            : `Sync failed: ${syncResult.message}`
          }
        </div>
      )}

      {stats && isAdminOrManager && (
        <div style={statsRowStyle}>
          <div style={statCardStyle}><div style={{ fontSize: '24px', fontWeight: '600' }}>{stats.totalIssues || 0}</div><div>Total Issues</div></div>
          <div style={statCardStyle}><div style={{ fontSize: '24px', fontWeight: '600' }}>{stats.byStatus?.open || 0}</div><div>Open</div></div>
          <div style={statCardStyle}><div style={{ fontSize: '24px', fontWeight: '600' }}>{stats.byStatus?.['in-progress'] || 0}</div><div>In Progress</div></div>
          <div style={statCardStyle}><div style={{ fontSize: '24px', fontWeight: '600' }}>{stats.byStatus?.testing || 0}</div><div>Testing</div></div>
          <div style={statCardStyle}><div style={{ fontSize: '24px', fontWeight: '600' }}>{stats.byStatus?.resolved || 0}</div><div>Resolved</div></div>
          <div style={statCardStyle}><div style={{ fontSize: '24px', fontWeight: '600' }}>{stats.byStatus?.closed || 0}</div><div>Closed</div></div>
          <div style={statCardStyle}><div style={{ fontSize: '24px', fontWeight: '600' }}>{stats.totalProjects || 0}</div><div>Projects</div></div>
          <div style={statCardStyle}><div style={{ fontSize: '24px', fontWeight: '600' }}>{stats.totalUsers || 0}</div><div>Users</div></div>
        </div>
      )}

      <div style={controlsStyle}>
        <input
          data-testid="search-input"
          type="text"
          placeholder="Search issues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          style={{ ...inputStyle, flex: '1', minWidth: '200px' }}
        />
        <button onClick={handleSearch} style={btnStyle}>Search</button>

        <select
          data-testid="filter-status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={inputStyle}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="testing">Testing</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          data-testid="filter-priority"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={inputStyle}
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        {(isAdminOrManager || isTester) && (
          <button
            data-testid="add-task-btn"
            onClick={() => { setEditingIssue(null); setShowModal(true); }}
            style={btnStyle}
          >
            + Add Issue
          </button>
        )}
      </div>

      <div>
        {items.length === 0 && <p>No issues found.</p>}
        {items.map((issue) => (
          <div key={issue._id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{issue.title}</div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                  {issue.issueId} | Project: {issue.projectId}
                  {issue.assignedTo && ` | Assigned: ${issue.assignedTo}`}
                </div>
                <div>
                  <span style={badgeStyle(statusColors[issue.status] || '#999')}>{issue.status}</span>
                  <span style={badgeStyle(priorityColors[issue.priority] || '#999')}>{issue.priority}</span>
                  <span style={badgeStyle('#7f8c8d')}>{issue.severity}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  data-testid="edit-task-btn"
                  onClick={() => handleEdit(issue)}
                  style={{ padding: '4px 10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Edit
                </button>
                {isAdminOrManager && (
                  <button
                    data-testid="delete-task-btn"
                    onClick={() => handleDelete(issue._id)}
                    style={{ padding: '4px 10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <IssueModal
          issue={editingIssue}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingIssue(null); }}
        />
      )}
    </div>
  );
}

export default DashboardPage;
