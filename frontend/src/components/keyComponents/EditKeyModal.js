import React, { useState, useEffect  } from 'react';

const EditKeyModal = ({ keyData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    type: keyData.type,
    location: keyData.location
  });
  const [error, setError] = useState('');

  // useEffect(() => {
  //   const checkStatus = async () => {
  //     try {
  //       const res = await fetch(`/api/transactions/${keyData._id}/verify-key-status`);
  //       const data = await res.json();
        
  //       if (data.currentTransaction) {
  //         setError('Key is currently checked out - cannot edit status');
  //       }
  //     } catch (error) {
  //       console.error('Status check failed:', error);
  //     }
  //   };
    
  //   checkStatus();
  // }, [keyData._id]);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     // Clear error on new submission
  //     setError('');

  //     // Clear transaction reference if marking available
  //     const updates = { 
  //       ...formData,
  //       currentTransaction: formData.status === 'available' ? null : formData.currentTransaction
  //     };

      
  //     // Remove internal fields
  //     // delete updates._id;
  //     delete updates.__v;
  //     delete updates.createdAt;

  //     await onSave(updates);
  //   } catch (error) {
  //     setError(error.message);
  //   }
  // };

  // const handleStatusChange = (newStatus) => {
  //   const validTransitions = {
  //     'available': ['checked-out', 'lost'],
  //     'checked-out': ['available', 'lost'],
  //     'lost': ['available']
  //   };
  
  //   if (!validTransitions[formData.status].includes(newStatus)) {
  //     setError(`Invalid status transition: ${formData.status} → ${newStatus}`);
  //     return;
  //   }

  //   setFormData(prev => ({
  //     ...prev,
  //     status: newStatus,
  //     // Clear transaction reference when marking available
  //     currentTransaction: newStatus === 'available' ? null : prev.currentTransaction
  //   }));
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave({
        ...keyData,
        ...formData
      });
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Quick Edit Key</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* <select
            value={formData.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="available">Available</option>
            <option value="checked-out">Checked Out</option>
            <option value="lost">Lost</option>
          </select> */}

          {/* <input
            type="text"
            placeholder="Key Code"
            value={formData.keyCode}
            onChange={e => setFormData({...formData, keyCode: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full p-2 border rounded"
          /> */}
          
          <input
            type="text"
            placeholder="Type"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
          
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={e => setFormData({...formData, location: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditKeyModal;