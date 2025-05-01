import { useState, useEffect} from 'react';
import { useAuth } from '../AuthContext';
import AnalyticsSummary from '../components/charts/AnalyticsSummary';
import KeyStatusChart from '../components/charts/KeyStatusChart';
import TransactionTrends from '../components/charts/TransactionTrends';
import RecentActivity from '../components/charts/RecentActivityChart';
import { useNavigate } from 'react-router-dom';

// import KeyLocationMap from '../components/charts/KeyLocationMap';


export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalKeys: 0,
    keyStatuses: [],
    transactionTrends: [],
    recentActivity: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const endpoints = [
          '/api/keys/analytics',
          '/api/transactions/trends',
          '/api/transactions/recent-activity',
          '/api/requests/pending'
        ];
  

        const responses = await Promise.all(endpoints.map(url => 
          fetch(url, {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}` 
            }
          }).then(async res => {
            if (!res.ok) {
              const error = await res.json();
              throw new Error(error.error || `API request failed: ${res.status}`);
            }
            return res.json();
          })
        ));
  
        const [keyAnalytics, trends, recentActivity, requests] = responses;

        setAnalytics({
          totalKeys: keyAnalytics.totalKeys || 0,
          keyStatuses: keyAnalytics.keyStatuses || [],
          transactionTrends: trends.data || [],
          recentActivity: recentActivity.data || []
        });

        setPendingRequests(requests || []);
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleNotificationClick = (requestId) => {
    navigate(`/exchange?showRequests=true&requestId=${requestId}`);
  }

  if (loading) return <div className="p-4">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Notifications for Issuers */}
      {(user?.role === 'admin' || user?.role === 'issuer') && pendingRequests.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold mb-2">Pending Key Requests</h3>
          <div className="space-y-2">
            {pendingRequests.map(request => (
              <div key={request._id} className="flex justify-between items-center p-3 bg-white rounded border">
                <div>
                  <p className="font-medium">{request.user?.name}</p>
                  <p className="text-sm text-gray-600">{request.purpose}</p>
                </div>
                <button
                  onClick={() => handleNotificationClick(request._id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Review Request
                </button>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Dashboard content */}
      {(user?.role === 'admin' || user?.role === 'issuer') && (
        <>
          <AnalyticsSummary data={analytics} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <KeyStatusChart data={analytics.keyStatuses} />
            <TransactionTrends transactions={analytics.transactionTrends} />
          </div>
          <div className="grid grid-cols-1">
            <RecentActivity 
              activities={(analytics.recentActivity || []).filter(a => a?.items?.length > 0)}
            />
          </div>
        </>
      )}
    </div>
  );
}

