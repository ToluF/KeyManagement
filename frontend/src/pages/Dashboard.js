import { useState, useEffect, useContext } from 'react';
import { useAuth } from '../AuthContext';

import { Link } from 'react-router-dom';
import KeyStatusChart from '../components/charts/KeyStatusChart';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalKeys: 5,
    availableKeys: 3,
    issuedKeys: 2,
    recentActivity: []
  });
  const { logout } = useAuth();

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
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
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
          <KeyStatusChart data={stats.recentCheckouts} />
        </div>
      </div>
    </div>
  );

}

// // src/pages/Dashboard.js
// import React from 'react';
//


// const Dashboard = () => {
//   return (
//     <div className="dashboard">
//       <header>
//         <h1>Key Management Dashboard</h1>
//         <nav>
//           <ul>
//             <li>
//               <Link to="/inventory">Inventory</Link>
//             </li>
//             <li>
//               <Link to="/exchange">Key Exchange</Link>
//             </li>
//             <li>
//               <Link to="/audit">Audit Log</Link>
//             </li>
//             <li>
//               <Link to="/add-key">Add Key</Link>
//             </li>
//           </ul>
//         </nav>
//       </header>
//       <main>
//         <h2>Welcome to the Key Management System</h2>
//         <p>Select an option from the menu above to manage keys.</p>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;
