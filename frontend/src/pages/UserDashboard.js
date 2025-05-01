import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Link} from 'react-router-dom';
import RequestForm from '../components/RequestForm';

const UserDashboard = () => {
  const { user } = useAuth();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [availableKeys, setAvailableKeys] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const responses = await Promise.all([
          fetch('/api/requests/pending', {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}` 
            }
          })
        ]);

        const [requests] = await Promise.all(responses.map(res => res.json()));
        setPendingRequests(requests || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchAvailableKeys = async () => {
      try {
        const res = await fetch('/api/keys/available', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setAvailableKeys(data);
      } catch (error) {
        console.error('Failed to fetch keys:', error);
      }
    };
    
    if (showRequestModal) {
      fetchAvailableKeys();
    }
  }, [showRequestModal]);


  if (loading) return <div className="p-4">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back, {user?.name?.split(' ')[0] || 'Guest'}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Need to request access to a space? Start a new key exchange request below 
              or review your existing requests.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <button 
            onClick={() => setShowRequestModal(true)}
            className="w-full h-full flex flex-col items-center justify-center group"
          >
            <div className="mb-4 bg-blue-100 p-4 rounded-full transition-all group-hover:bg-blue-200">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">New Request</h3>
            <p className="text-gray-600 text-center">
              Start a new key exchange request for temporary access
            </p>
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <Link to="/my-requests" className="w-full h-full flex flex-col items-center justify-center group">
            <div className="mb-4 bg-purple-100 p-4 rounded-full transition-all group-hover:bg-purple-200">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">My Requests</h3>
            <p className="text-gray-600 text-center">
              View status of your existing requests and key exchanges
            </p>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600">Active Requests</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">24h</div>
              <div className="text-sm text-gray-600">Average Response Time</div>
            </div>
          </div>
        </div>

        {/* <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{availableKeys.length}</div>
              <div className="text-sm text-gray-600">Keys Available</div>
            </div>
          </div>
        </div> */}
      </div>

      <RequestForm
        show={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        availableKeys={availableKeys}
      />
    </div>
  );
};

export default UserDashboard;