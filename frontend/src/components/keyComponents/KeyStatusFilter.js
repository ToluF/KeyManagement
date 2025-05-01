// This component is used to filter keys based on their status.
import React from 'react';

export default function KeyStatusFilter({ value, onChange }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1">Filter by Status</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-lg bg-white"
      >
        <option value="all">All Keys</option>
        <option value="available">Available</option>
        <option value="unavailable">Unavailable</option>
        <option value="reserved">Reserved</option>
        <option value="checked-out">Checked Out</option>
        <option value="lost">Lost</option>
      </select>
    </div>
  );
}