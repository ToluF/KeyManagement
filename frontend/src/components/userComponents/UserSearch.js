import React from 'react';

export default function UserSearch({ value, onChange }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1">Search Users</label>
      <input
        type="text"
        placeholder="Search by name, email, or ID..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
