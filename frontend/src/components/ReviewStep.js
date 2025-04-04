import React from 'react';
import PropTypes from 'prop-types';

/**
 * Step 3: Review transaction details
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.transactionData - Transaction details
 * @param {Array} props.users - System users
 * @param {Array} props.keys - System keys
 * @param {Function} props.onSubmit - Submission handler
 * @param {Function} props.onBack - Back navigation handler
 */
const ReviewStep = ({ transactionData, keys, onSubmit, onBack }) => {
  // const user = users.find(u => u._id === transactionData.userId);
  const selectedKeys = keys.filter(k => 
    transactionData.keys?.includes(k._id)
  );

  return (
    <div className="flex flex-col ">
      <h3 className="text-lg font-medium">Confirm Transaction Details</h3>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-6">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">User Information</h4>
            <p className="font-semibold">{transactionData.user?.name || 'Unknown User'}</p>
            {transactionData.user?.department && (
              <p className="text-sm text-gray-600 mt-1">
                Department: {transactionData.user.department}
              </p>
            )}
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Selected Keys ({selectedKeys.length})</h4>
            <div className="space-y-2">
              {selectedKeys.map(key => (
                <div key={key._id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">{key.keyCode}</p>
                    <p className="text-sm text-gray-600">{key.location}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {key.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-auto border-t">
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Confirm Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

ReviewStep.propTypes = {
  transactionData: PropTypes.shape({
    user: PropTypes.object,
    keys: PropTypes.arrayOf(PropTypes.string)
  }),
  keys: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};

ReviewStep.defaultProps = {
  transactionData: {
    userId: '',
    keys: []
  }
};

export default ReviewStep;