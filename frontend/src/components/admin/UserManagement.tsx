import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchUsers, updateUserRole, toggleUserStatus } from '../../store/userSlice';

export default function UserManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector((state: RootState) => state.user.users);
  const loading = useSelector((state: RootState) => state.user.loading);
  const error = useSelector((state: RootState) => state.user.error);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      {loading && <div>Loading users...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <table className="w-full border">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: {
            id: string;
            name: string;
            email: string;
            role: string;
            active: boolean;
          }) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select value={user.role} onChange={e => dispatch(updateUserRole({ id: user.id, role: e.target.value }))}>
                  <option value="admin">Admin</option>
                  <option value="agent">Agent</option>
                  <option value="supplier">Supplier</option>
                  <option value="buyer">Buyer</option>
                  <option value="guest">Guest</option>
                </select>
              </td>
              <td>{user.active ? 'Active' : 'Inactive'}</td>
              <td>
                <button onClick={() => dispatch(toggleUserStatus(user.id))} className="btn btn-sm">
                  {user.active ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
