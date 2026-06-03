// Login/Register form → calls /auth/login or /auth/register → stores JWT in localStorage
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api';

function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('developer');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (isRegister) {
        data = await registerUser(name, email, password, role, department);
      } else {
        data = await loginUser(email, password);
      }
      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        navigate('/dashboard');
      } else {
        setError('No token received');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: '4px' };
  const fieldStyle = { marginBottom: '16px' };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ background: '#fff', padding: '32px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>
          Issue Tracker - {isRegister ? 'Register' : 'Login'}
        </h2>
        {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Name</label>
              <input
                data-testid="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          )}
          <div style={fieldStyle}>
            <label style={labelStyle}>Email</label>
            <input
              data-testid="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Password</label>
            <input
              data-testid="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          {isRegister && (
            <>
              <div style={fieldStyle}>
                <label style={labelStyle}>Role</label>
                <select
                  data-testid="role-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={inputStyle}
                >
                  <option value="developer">Developer</option>
                  <option value="tester">Tester</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Department</label>
                <input
                  data-testid="department-input"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Engineering"
                  style={inputStyle}
                />
              </div>
            </>
          )}
          <button
            data-testid="login-btn"
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '12px' }}
          >
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <p style={{ textAlign: 'center', margin: 0 }}>
          <button
            data-testid="toggle-auth-btn"
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;