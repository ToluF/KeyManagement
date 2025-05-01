import React, { useState, useEffect } from 'react';

import { useAuth } from '../AuthContext';
import TransactionWizard from '../components/transactionComponents/TransactionWizard';
import TransactionDetailsModal from '../components/transactionComponents/TransactionDetailsModal';
import TransactionStatusBadge from '../components/transactionComponents/TransactionStatusBadge';
import RequestModal from '../components/RequestModal';

/**
 * Main view for managing key transactions
 * Shows active and completed transactions with status tracking
 */
const KeyExchangeStatus = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keys, setKeys] = useState([])
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  // New state for filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  // Add state for requests
  const [requests, setRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);



  // Fetch transactions from new API endpoint
  const fetchTransactions = async (page = 1) => {
    setIsSearchLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        limit: itemsPerPage,
        search: searchQuery,
        status: statusFilter
      });

      const res = await fetch(
        `/api/transactions/getId?${params}`, 
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      // Handle non-JSON responses
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid response format: ${await res.text()}`);
      }

      const data = await res.json();
      
      console.log('Raw response:', res); // Add this
    
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      setTransactions(data.transactions);
      setCurrentPage(data.currentPage)
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setIsSearchLoading(false); 
    }
  };

  // Add fetchKeys function
  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/keys/available', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setKeys(data);
      return data;
    } catch (error) {
      console.error('Error fetching keys:', error);
      return [];
    }
  };

  //  fetch requests function
  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests/issuer', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const showRequestsParam = params.get('showRequests');
    
    if (showRequestsParam === 'true') {
      setShowRequests(true);
      fetchRequests();
    }
  }, []);

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage, searchQuery, statusFilter]);
  
  // Add this useEffect for search input debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTransactions(1);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, statusFilter]);

  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');
  
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'REQUEST_UPDATE') {
        setRequests(prev => prev.map(r => 
          r._id === message.data._id ? message.data : r
        ));
      }
    };
  
    return () => ws.close();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Handle key return action
  const handleReturn = async (transactionId, keyId) => {
    try {
      const response = await fetch(`/api/transactions/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          transactionId,
          keyId 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Return operation failed');
      }

      // Refresh both transactions and keys
      await fetchKeys(); // Add this line
      await fetchTransactions();
    } catch (error) {
      console.error('Return failed:', error);
      alert(error.message);
    }
  };

  // Add mark lost handler
  const handleMarkLost = async (transactionId, keyId) => {
    try {
      const response = await fetch(`/api/transactions/mark-lost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ transactionId, keyId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Mark lost operation failed');
      }

      await Promise.all([fetchTransactions(), fetchKeys()]);
    } catch (error) {
      console.error('Mark lost failed:', error);
      alert(error.message);
    }
  };

  // const handleApproveRequest = async (requestId) => {
  //   try {
  //     await fetch(`/api/requests/${requestId}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${localStorage.getItem('token')}`
  //       },
  //       body: JSON.stringify({ status: 'approved' })
  //     });
  //     fetchRequests(); // Refresh the list
  //   } catch (error) {
  //     console.error('Approval failed:', error);
  //   }
  // };
  
  const handleRejectRequest = async (requestId) => {
    try {
      await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Rejection failed:', error);
    }
  };

  const handleConvertRequest = async (requestId) => {
    try {
      const res = await fetch('/api/transactions/from-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ requestId })
      });

      if (!res.ok) throw new Error('Conversion failed');
      
      // Refresh both transactions and requests
      await Promise.all([fetchTransactions(), fetchRequests()]);
    } catch (error) {
      console.error('Conversion error:', error);
      alert(error.message);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading transactions...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Key Transactions</h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setShowRequests(true);
              fetchRequests();
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            View Requests ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setShowWizard(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            New Transaction
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search transactions..."
          className="w-full p-2 border rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
                
        <div className="flex gap-4">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            } ${isSearchLoading ? 'opacity-50' : ''}`}
            disabled={isSearchLoading}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg ${
              statusFilter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            } ${isSearchLoading ? 'opacity-50' : ''}`}
            disabled={isSearchLoading}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-lg ${
              statusFilter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            } ${isSearchLoading ? 'opacity-50' : ''}`}
            disabled={isSearchLoading}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {isSearchLoading && (
          <div className="p-2 text-center text-gray-500">
            Loading transactions...
          </div>
        )}
        {transactions.map(transaction => {
          const totalKeys = transaction.items?.length || 0;
          const returnedCount = transaction.items?.filter(item => 
            ['returned', 'lost'].includes(item.status)
          ).length || 0;

          return (
            <div 
              key={transaction._id}
              className="bg-white p-4 rounded-lg shadow-sm border"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">
                    Transaction {transaction.transactionId}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Issued by</p>
                      <p className="font-medium text-sm">
                        {transaction.issuer?.name || 'Unknown Issuer'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Assigned to</p>
                      <p className="font-medium text-sm">
                        {transaction.user?.name || 'Unknown User'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <TransactionStatusBadge status={transaction.status} />
                 
                  <div className="mt-2">
                    <p className="text-sm">
                      {transaction.status === 'completed' ? (
                        <span className="text-green-600">
                          {returnedCount}/{totalKeys} returned
                        </span>
                      ) : (
                        <>
                          <span className="text-blue-600">{returnedCount}</span>
                          <span className="text-gray-500">/{totalKeys} returned</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

  
         
              <div className="mt-3 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(returnedCount / totalKeys) * 100}%` }}
                ></div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    Issued: {new Date(transaction.checkoutDate).toLocaleDateString()}
                  </p>
                </div> 
                <button
                  onClick={() => setSelectedTransaction(transaction)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Details →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        
        <span>Page {currentPage} of {totalPages}</span>
         
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <TransactionWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onSuccess={fetchTransactions}
      />

      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onReturn={handleReturn}
          onMarkLost={handleMarkLost}
        />
      )}

      {showRequests && (
        <RequestModal
          requests={requests}
          onClose={() => {
            setShowRequests(false);
            window.history.replaceState({}, document.title, window.location.pathname);
          }}
          onConvert={handleConvertRequest}
          onReject={handleRejectRequest}
          initialRequestId={new URLSearchParams(window.location.search).get('requestId')}
        />
      )}

    </div>
  );
};

export default KeyExchangeStatus