import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';

const MyRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch('/api/requests/my-requests', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!res.ok) throw new Error('Failed to fetch requests');
        
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-6 text-center">Loading requests...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Key Requests</h1>
        <Link
          to="/user-dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          New Request
        </Link>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No requests found</p>
          </div>
        ) : (
          requests.map(request => (
            <div key={request._id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {request.purpose}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Requested on: {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Preferred Times</h3>
                  <ul className="mt-1 space-y-1">
                    {request.preferredDates.map((date, index) => (
                      <li key={index} className="text-sm text-gray-900">
                        {date.date} - {date.timeSlot}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-600">Keys Requested</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {request.keys.map(key => (
                      <span 
                        key={key._id}
                        className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700"
                      >
                        {key.keyCode} ({key.description})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {request.issuer && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    Processed by: {request.issuer.name}
                    {request.updatedAt && (
                      <span className="ml-2">
                        on {new Date(request.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyRequests;