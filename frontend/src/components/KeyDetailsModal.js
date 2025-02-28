import React, { useState } from 'react';

const KeyDetailsModal = ({ open, user, keys, onReturn, onMarkLost, onClose }) => {
  const [markedLost, setMarkedLost] = useState({});

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{user.name}'s Assigned Keys</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <div className="space-y-3">
          {keys.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No keys assigned</p>
          ) : (
            keys.map(key => (
              <div key={key._id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{key.keyCode}</p>
                  <p className="text-sm text-gray-600">{key.location}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={!!markedLost[key._id]}
                      onChange={(e) => setMarkedLost(prev => ({
                        ...prev,
                        [key._id]: e.target.checked
                      }))}
                      className="form-checkbox h-4 w-4"
                    />
                    Mark Lost
                  </label>
                  
                  <button
                    onClick={() => markedLost[key._id] 
                      ? onMarkLost(key._id) 
                      : onReturn(key._id)}
                    className={`px-3 py-1 rounded transition-colors ${
                      markedLost[key._id] 
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {markedLost[key._id] ? 'Confirm Lost' : 'Return Key'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyDetailsModal;