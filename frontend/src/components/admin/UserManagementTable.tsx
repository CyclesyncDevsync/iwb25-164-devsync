import React from 'react';

export function UserManagementTable() {
  // Placeholder: Replace with real user management table
  return (
    <div className="p-2">
      <h2 className="font-bold mb-2">User Management</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="p-2">Admin Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2">Jane Doe</td>
            <td className="p-2">jane@circularsync.com</td>
            <td className="p-2">
              <button className="px-2 py-1 bg-green-500 text-white rounded">Add</button>
              <button className="px-2 py-1 bg-red-500 text-white rounded ml-2">Remove</button>
            </td>
          </tr>
          {/* More rows... */}
        </tbody>
      </table>
    </div>
  );
}
