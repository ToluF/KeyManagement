import { useState, useEffect, useContext } from 'react';
import { useAuth } from '../AuthContext';

import { Link } from 'react-router-dom';
import KeyStatusChart from '../components/charts/KeyStatusChart';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalKeys: 0,
    availableKeys: 0,
    issuedKeys: 0,
    statusDistribution: [],
    recentActivity: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/exchange/analytics');
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);


  // useEffect(() => {
  //   const fetchData = async () => {
  //     const res = await fetch('/api/analytics');
  //     const data = await res.json();
  //     setStats(data);
  //   };
  //   fetchData();
  // }, []);

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Total Keys</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{stats.totalKeys}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Available Keys</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.availableKeys}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Issued Keys</h3>
          <p className="mt-2 text-3xl font-bold text-orange-600">{stats.issuedKeys}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Key Status Distribution</h3>
          <KeyStatusChart data={stats.statusDistribution || []} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Recent Checkouts</h3>
          <KeyStatusChart data={stats.recentActivity.map(activity => ({
            label: activity.userName,
            value: 1 // Dummy value
          }))} />
        </div>
      </div>
    </div>
  );

}

