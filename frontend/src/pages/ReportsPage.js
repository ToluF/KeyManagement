import React, { useState } from 'react';
import { CSVLink } from 'react-csv';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ReportsPage = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reportData, setReportData] = useState([]);
  const [reportType, setReportType] = useState('daily');

  const fetchReportData = async () => {
    try {
      const res = await fetch(`/api/reports?type=${reportType}&start=${startDate.toISOString()}&end=${endDate.toISOString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Generate Reports</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select 
              className="w-full p-2 border rounded"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="daily">Daily Transactions</option>
              <option value="keys">Key Inventory</option>
              <option value="audit">Audit Logs</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <button
          onClick={fetchReportData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate Report
        </button>

        {reportData.length > 0 && (
          <div className="mt-4">
            <CSVLink 
              data={reportData}
              filename={`${reportType}_report_${new Date().toISOString()}.csv`}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download CSV
            </CSVLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;