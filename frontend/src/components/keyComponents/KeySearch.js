import React from 'react';

export default function KeySearch({ value, onChange }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1">Search Keys</label>
      <input
        type="text"
        placeholder="Search by code, description, or location..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}