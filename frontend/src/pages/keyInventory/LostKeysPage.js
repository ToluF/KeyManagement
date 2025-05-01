import { useState, useEffect } from 'react';
import LostKeyItem from '../../components/keyComponents/LostKeyItem';
import Spinner from '../../components/layout/Spinner';

export default function LostKeysPage() {
  const [lostKeys, setLostKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLostKeys = async () => {
      try {
        const res = await fetch('/api/keys?status=lost');
        if (!res.ok) throw new Error('Failed to fetch lost keys');
        const data = await res.json();
        setLostKeys(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLostKeys();
  }, []);

  const handleMarkFound = async (keyId) => {
    try {
      const res = await fetch(`/api/keys/${keyId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'available' })
      });

      if (!res.ok) throw new Error('Update failed');
      setLostKeys(prev => prev.filter(k => k._id !== keyId));
    } catch (err) {
      setError(err.message);
    }
  };

  console.log('Lost keys:', lostKeys);
  if (loading) return <Spinner fullPage />;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h1 className="text-lg leading-6 font-medium text-gray-900">
            Lost Key Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {lostKeys.length} lost key{lostKeys.length !== 1 && 's'} found
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {lostKeys.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No lost keys found
            </div>
          ) : (
            <div className="space-y-4">
              {lostKeys.map(key => (
                <LostKeyItem 
                  key={key._id}
                  keyData={key}
                  onMarkFound={() => handleMarkFound(key._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}