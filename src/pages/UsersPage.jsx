// Users page — simple black and white
import { useEffect, useState } from 'react';
import { useApp } from '../context/TaskContext';
import { getAllUsers } from '../services/api';
import Navbar from '../components/Navbar';

function UsersPage() {
  const { dispatch } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getAllUsers();
        setUsers(res.data || []);
        dispatch({ type: 'SET_USERS', payload: res.data || [] });
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <h1>Users</h1>
        {loading ? <p>Loading...</p> : (
          <table style={tbl}><thead><tr><th style={th}>User ID</th><th style={th}>Name</th><th style={th}>Email</th><th style={th}>Role</th><th style={th}>Department</th><th style={th}>Status</th></tr></thead>
            <tbody>{users.map(u => <tr key={u._id}><td style={td}>{u.userId}</td><td style={td}>{u.name}</td><td style={td}>{u.email}</td><td style={td}>{u.role}</td><td style={td}>{u.department}</td><td style={td}>{u.status}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const tbl = { width: '100%', borderCollapse: 'collapse' };
const th = { border: '1px solid #000', padding: '6px', textAlign: 'left' };
const td = { border: '1px solid #000', padding: '6px' };

export default UsersPage;
