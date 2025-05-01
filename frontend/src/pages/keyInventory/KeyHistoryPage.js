import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KeyIcon, ClockIcon, UserIcon } from '@heroicons/react/outline';
// import KeySearch from '../../components/KeySearch';
// import KeyStatusFilter from '../../components/KeyStatusFilter';
import Spinner from '../../components/layout/Spinner';

const HistoryPage = () => {
  const { keyId } = useParams();
  // const navigate = useNavigate();
  // const [keys, setKeys] = useState([]);
  const [history, setHistory] = useState({ keyCode: '', history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // const [filters, setFilters] = useState({
  //   searchQuery: '',
  //   status: 'all'
  // });

  // Fetch all keys for the sidebar
  // useEffect(() => {
  //   const fetchKeys = async () => {
  //     const query = new URLSearchParams(filters);
  //     const res = await fetch(`/api/keys?${query}`);
  //     const data = await res.json();
  //     setKeys(data);
  //   };
  //   fetchKeys();
  // }, [filters]);

  // Fetch history when keyId changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!keyId) return;
      
      setLoading(true);
      try {
        const res = await fetch(`/api/keys/${keyId}/history`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch history');
        const data = await res.json();
        setHistory(data || []);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [keyId]);

  const getActionLabel = (action) => {
    switch (action) {
      case 'checkout': return 'Checked Out';
      case 'return': return 'Returned';
      case 'marked_lost': return 'Marked Lost';
      default: return action;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <ClockIcon className="h-8 w-8 text-gray-600 mr-3" />
          <h2 className="text-2xl font-bold">
            History for Key {history.keyCode || `#${keyId}`}
          </h2>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Action</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Issuer</th>
              </tr>
            </thead>
            <tbody>
              {history.history?.map((transaction, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-2 capitalize">
                    {getActionLabel(transaction.action)}
                  </td>
                  <td className="px-4 py-2">
                    {transaction.user || 'System'}
                  </td>
                  <td className="px-4 py-2">{transaction.issuer}</td>
                </tr>
              ))}
              {history.history?.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                    No transaction history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
//   return (
//     <div className="max-w-7xl mx-auto flex gap-6">
//       {/* Key List Sidebar */}
//       <div className="w-80 flex-shrink-0">
//         <div className="mb-6">
//           <h2 className="text-xl font-bold mb-4 flex items-center">
//             <KeyIcon className="h-6 w-6 mr-2" />
//             Key Search
//           </h2>
//           <div className="space-y-4">
//             <KeySearch 
//               value={filters.searchQuery}
//               onChange={(value) => setFilters(prev => ({...prev, searchQuery: value}))}
//             />
//             <KeyStatusFilter
//               value={filters.status}
//               onChange={(value) => setFilters(prev => ({...prev, status: value}))}
//             />
//           </div>
//         </div>

//         <div className="space-y-2">
//           {keys.map(key => (
//             <div
//               key={key._id}
//               onClick={() => navigate(`/inventory/history/${key._id}`)}
//               className={`p-3 cursor-pointer rounded-lg ${
//                 keyId === key._id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
//               }`}
//             >
//               <div className="flex justify-between items-center">
//                 <span className="font-medium">{key.keyCode}</span>
//                 <span className={`text-sm px-2 py-1 rounded-full ${
//                   key.status === 'available' ? 'bg-green-100 text-green-700' :
//                   key.status === 'lost' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
//                 }`}>
//                   {key.status}
//                 </span>
//               </div>
//               <p className="text-sm text-gray-600 truncate">{key.description}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* History Panel */}
//       <div className="flex-1">
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           {keyId ? (
//             <>
//               <div className="flex items-center mb-6">
//                 <ClockIcon className="h-8 w-8 text-gray-600 mr-3" />
//                 <h2 className="text-2xl font-bold">
//                   History for Key {history.keyCode || `#${keyId}`}
//                 </h2>
//               </div>

//               {error && <p className="text-red-500 mb-4">{error}</p>}

//               {loading ? (
//                 <div className="text-center py-4">Loading history...</div>
//               ) : (
//                 <table className="w-full">
//                   <thead>
//                     <tr className="bg-gray-50">
//                       <th className="px-4 py-2 text-left">Date</th>
//                       <th className="px-4 py-2 text-left">Action</th>
//                       <th className="px-4 py-2 text-left">User</th>
//                       <th className="px-4 py-2 text-left">Issuer</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {history.history?.map((transaction, index) => (
//                       <tr key={index} className="border-t">
//                         <td className="px-4 py-2">
//                           {new Date(transaction.date).toLocaleDateString('en-US', {
//                             year: 'numeric',
//                             month: 'short',
//                             day: 'numeric',
//                             hour: '2-digit',
//                             minute: '2-digit'
//                           })}
//                         </td>
//                         <td className="px-4 py-2 capitalize">
//                           {getActionLabel(transaction.action)}
//                         </td>
//                         <td className="px-4 py-2">
//                           {transaction.user || 'System'}
//                         </td>
//                         <td className="px-4 py-2">{transaction.issuer}</td>
//                       </tr>
//                     ))}
//                     {history.history?.length === 0 && (
//                       <tr>
//                         <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
//                           No transaction history found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               )}
//             </>
//           ) : (
//             <div className="text-center py-8 text-gray-500">
//               Select a key from the list to view its history
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
// 
