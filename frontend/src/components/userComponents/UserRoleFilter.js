import React from 'react';

export default function UserRoleFilter({ value, onChange }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1">Filter by Role</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-lg bg-white"
      >
        <option value="all">All Roles</option>
        <option value="admin">Admin</option>
        <option value="issuer">Issuer</option>
        <option value="user">User</option>
      </select>
    </div>
  );
}
