import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Step 2: Select keys for transaction
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.keys - Available keys
 * @param {Array} props.selectedKeys - Selected key IDs
 * @param {Function} props.onSelect - Selection handler
 * @param {Function} props.onBack - Back navigation handler
 */
const KeySelectionStep = ({ keys = [], selectedKeys = [], onSelect, onBack, onNext }) => {
  const [searchQuery, setSearchQuery] = useState('');
 
  // Filter keys based on search query
  const filteredKeys = keys.filter(
    (key) => 
      key.keyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.location.toLowerCase().includes(searchQuery.toLowerCase())
    
  );

  const toggleKey = (keyId) => {
    const newSelection = selectedKeys.includes(keyId)
      ? selectedKeys.filter(id => id !== keyId)
      : [...selectedKeys, keyId];
    onSelect(newSelection);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Keys</h3>
            
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search keys by code or location..."
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Key List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredKeys.length === 0 ? (
          <div className="col-span-2 text-center text-gray-500 py-4">
            No keys found matching your search
          </div>
        ) : (
          filteredKeys.map(key => (
            <div
              key={key._id}
              onClick={() => toggleKey(key._id)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedKeys.includes(key._id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'hover:border-gray-400'
              }`}
            >
              <div className="font-medium">{key.keyCode}</div>
              <div className="text-sm text-gray-600">{key.location}</div>
              <div className="text-sm mt-1">
                Status: <span className="capitalize">{key.status}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {selectedKeys.length} keys selected
          </div>
          <button
            onClick={onNext} // Add this button
            disabled={selectedKeys.length === 0}
            className={`px-4 py-2 ${
              selectedKeys.length === 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-lg`}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

KeySelectionStep.propTypes = {
  keys: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.any.isRequired,
      keyCode: PropTypes.string,
      location: PropTypes.string,
      status: PropTypes.string
    })
  ).isRequired,
  selectedKeys: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired 

};


KeySelectionStep.defaultProps = {
  selectedKeys: []  // Default to empty array
};

export default KeySelectionStep;