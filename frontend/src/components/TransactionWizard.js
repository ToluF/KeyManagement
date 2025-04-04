// src/components/TransactionWizard.js
import React, { useState, useEffect } from 'react';
import UserVerificationStep from './UserVerificationStep';
import KeySelectionStep from './KeySelectionStep';
import ReviewStep from './ReviewStep';


// const steps = ['User Verification', 'Key Selection', 'Review & Confirm'];

/**
 * Guided process for creating new key transactions
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls wizard visibility
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSuccess - Success callback
 */
const TransactionWizard = ({open, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [transactionData, setTransactionData] = useState({
    user: null,
    keys: []
  });
  const [availableKeys, setAvailableKeys] = useState([]);
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState({ users: true, keys: true });
  const [error, setError] = useState(null);

  const resetWizard = () => {
    setCurrentStep(0);
    setTransactionData({ user: null, keys: [] });
    setError(null);
  };

  // Fetch required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get available keys
        const keysRes = await fetch('/api/keys/available', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!keysRes.ok) throw new Error('Failed to fetch keys');
        const keys = await keysRes.json();
        setAvailableKeys(keys);

        // // Get users
        // const usersRes = await fetch('/api/users', {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`
        //   }
        // });
        // const users = await usersRes.json();
        // setUsers(users);

        setLoading({  keys: false });
      } catch (err) {
        setError(err.message);
      }
    };

    if (open) fetchData();
    else {
      resetWizard();
    }
  }, [open]);

  const handleUserVerification = (userData) => {
    setTransactionData(prev => ({ ...prev, user: userData }));
    setCurrentStep(1);
  };

  const handleKeySelect = (selectedKeys) => {
    setTransactionData(prev => ({ ...prev, keys: selectedKeys }));
    // setCurrentStep(2);
  };

  // Add new function to advance step
  // const handleAdvanceStep = () => {
  //   setCurrentStep(prev => prev + 1);
  // };

  const handleSubmit = async () => {
    let transactionId
    try {
      // Validate user selection
      if (!transactionData.user?._id) {
        throw new Error('No user selected');
      }

      // Validate key selection
      if (transactionData.keys.length === 0) {
        throw new Error('No keys selected');
      }

      // 1. Create draft transaction
      const createRes = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: transactionData.user._id
        })
      });

      console.log('Create draft response:', createRes);
  
      if (!createRes.ok) {
        const errorData = await createRes.json(); // Get detailed error
        console.error('Draft creation error:', errorData);
        throw new Error(errorData.error || 'Failed to create transaction draft');
      }
      
      const { id: transactionId } = await createRes.json();
      // const responseData = await createRes.json();
      console.log('Draft created:', transactionId);
      // const transactionId = responseData.id;

      
      console.log('Attempting to add items to transaction ID:', transactionId);

      const validationRes = await fetch('/api/transactions/validate-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ keyIds: transactionData.keys.map(id => id.toString()) })
      });
      
      if (!validationRes.ok) {
        throw new Error('Key validation failed');
      }
      
      const validationData = await validationRes.json();
      if (validationData.invalidKeys?.length > 0) {
        throw new Error(`Invalid keys: ${validationData.invalidKeys.join(', ')}`);
      }
      
      // 2. Add keys to transaction
      const itemsRes = await fetch(`/api/transactions/${transactionId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          keyIds: transactionData.keys.map(id => id.toString())
        })
      });

      console.log('Add items response:', itemsRes);
  
      if (!itemsRes.ok) {
        const errorData = await itemsRes.json();
        console.error('Key addition error details:', errorData);
        throw new Error(errorData.error || 'Failed to add keys. Check key availability');
      }
  
      // 3. Finalize the transaction
      const finalizeRes = await fetch(`/api/transactions/${transactionId}/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (!finalizeRes.ok) {
        throw new Error('Failed to finalize transaction');
      }
  
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Transaction error:', error);
      setError(`Transaction failed: ${error.message}`);

      // Clean up: delete the transaction if it was created
      if (transactionId) {
        await fetch(`/api/transactions/${transactionId}/delete`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      console.error('Full transaction error:', {
        error: error.message,
        transactionData,
        stack: error.stack
      });
      setError(`Transaction failed: ${error.message}`);
    }
  };

  // TransactionWizard.js
  // const verifyUser = async (userId) => {
  //   try {
  //     const res = await fetch('/api/transactions/verify-user', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${localStorage.getItem('token')}`
  //       },
  //       body: JSON.stringify({ userId })
  //     });
      
  //     if (!res.ok) throw new Error('User verification failed');
      
  //     return await res.json();
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  if (!open) return null;
  if (loading.users || loading.keys) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-auto flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">New Key Transaction</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 test-sm"
            >
              Cancel
            </button>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl p-2"
            >
              &times;
            </button>
        </div>
      </div>

        <div className="flex mb-6">
          {['Verify User', 'Select Keys', 'Confirm'].map((step, index) => (
            <div key={step} className="flex-1">
              <div className={`h-2 ${index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <p className="text-sm mt-2 text-center">{step}</p>
            </div>
          ))}
        </div>

        {loading.users || loading.keys ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <>
            {currentStep === 0 && (
              <UserVerificationStep 
                users={users}
                onVerify={handleUserVerification}
              />
            )}

            {currentStep === 1 && (
              <KeySelectionStep
                keys={availableKeys}
                selectedKeys={transactionData.keys}
                onSelect={handleKeySelect}
                onBack={() => setCurrentStep(0)}
                onNext={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 2 && (
              <ReviewStep
                transactionData={transactionData}
                keys={availableKeys}
                onSubmit={handleSubmit}
                onBack={() => setCurrentStep(1)}
              />
            )}
          </>
        )}

        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
      </div>
    </div>
  );
};

export default TransactionWizard;