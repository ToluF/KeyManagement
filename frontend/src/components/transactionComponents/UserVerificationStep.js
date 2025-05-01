import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Step 1: Verify user identity through credentials
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onVerify - Verification success handler
 */
const UserVerificationStep = ({ onVerify }) => {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const res = await fetch('/api/users/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      // console.log('Raw response:', res); // Add this
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }

      const userData = await res.json();
      setUserInfo(userData);
      onVerify({
        ...userData,
        _id: userData.id // Ensure we're passing the MongoDB _id
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Verify User ID</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Scan User ID"
          className="w-full p-2 border rounded-lg"
          value={userId}
          onChange={(e) => setUserId(e.target.value.trim())}
          required
        />

        {userInfo && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">Verified User:</p>
            <p>{userInfo.name}</p>
            <p className="text-sm text-gray-600">
              {userInfo.department}
            </p>
          </div>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={verifying}
          className={`w-full py-2 px-4 text-white rounded-lg ${
            verifying ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {verifying ? 'Verifying...' : 'Verify ID'}
        </button>
      </form>
    </div>
  );
};

UserVerificationStep.propTypes = {
  onVerify: PropTypes.func.isRequired
};

export default UserVerificationStep;