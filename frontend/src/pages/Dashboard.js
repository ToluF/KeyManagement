import { useState, useEffect} from 'react';
// import KeyStatusChart from '../components/charts/KeyStatusChart';
// import RecentActivityChart from '../components/charts/RecentActivityChart';

// Temporary sample data - can be removed once API works
const sampleData = {
  totalKeys: 42,
  availableKeys: 28,
  issuedKeys: 14,
  statusDistribution: [
    { label: 'AVAILABLE', value: 28 },
    { label: 'CHECKED-OUT', value: 12 },
    { label: 'LOST', value: 2 }
  ],
  recentActivity: [
    {
      _id: '661a1d5f4b2e8a3d5c8b9d1e',
      userName: 'John Doe',
      keyCode: 'MAIN-102',
      date: '2024-04-12T14:30:00Z'
    },
    {
      _id: '661a1d5f4b2e8a3d5c8b9d1f',
      userName: 'Jane Smith',
      keyCode: 'LAB-205',
      date: '2024-04-11T09:15:00Z'
    }
  ]
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useSampleData, setUseSampleData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (useSampleData) {
          // Use sample data immediately
          setStats(sampleData);
          setLoading(false);
          return;
        }

      //   const res = await fetch('/api/transactions/analytics', {
      //     headers: {
      //       'Authorization': `Bearer ${localStorage.getItem('token')}`
      //     }
      //   });
        
      //   if (!res.ok) {
      //     const errorData = await res.json();
      //     throw new Error(errorData.error || 'Failed to fetch analytics');
      //   }

      //   const data = await res.json();
      
      //   // Transform status distribution for the chart
      //   const transformedDistribution = Object.entries(data.statusDistribution || {})
      //     .map(([status, count]) => ({
      //       label: status?.toUpperCase() || 'UNKNOWN',
      //       value: count || 0
      //     }));

      //   setStats({
      //     ...data,
      //     statusDistribution: transformedDistribution,
      //   });
      } catch (error) {
        console.error('Error fetching data:', error);
        alert(`Error loading analytics: ${error.message}`);
      }
    };

    fetchData();
  }, [useSampleData]);

  if (loading) return <div className="p-6 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  // if (!stats) return <div className="p-6 text-center">No data available</div>;

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const res = await fetch('/api/analytics');
  //     const data = await res.json();
  //     setStats(data);
  //   };
  //   fetchData();
  // }, []);


  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Key Management Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Keys"
          value={stats.totalKeys}
          color="text-blue-600"
        />
        <StatCard
          title="Available Keys"
          value={stats.availableKeys}
          color="text-green-600"
        />
        <StatCard
          title="Issued Keys"
          value={stats.issuedKeys}
          color="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
          <RecentActivityList activities={stats.recentActivity} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-500">{title}</h3>
      <p className={`mt-2 text-3xl font-bold ${color}`}>
        {value || 0}
      </p>
    </div>
  );
}

function RecentActivityList({ activities }) {
  return (
    <div className="space-y-2">
      {activities?.map((activity, index) => (
        <div key={index} className="flex justify-between items-center p-2 border-b">
          <div>
            <p className="font-medium">{activity.keyCode || 'Unknown Key'}</p>
            <p className="text-sm text-gray-600">{activity.userName}</p>
          </div>
          <span className="text-sm text-gray-500">
            {new Date(activity.date).toLocaleDateString()}
          </span>
        </div>
      ))}
      {!activities?.length && (
        <p className="text-center text-gray-500 py-4">No recent activity</p>
      )}
    </div>
  );
}

