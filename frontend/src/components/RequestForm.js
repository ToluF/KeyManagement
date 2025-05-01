import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { toast } from 'react-toastify';

const RequestCreationModal = ({ 
  show, 
  onClose, 
  availableKeys,
  userRole 
}) => {
  const [formData, setFormData] = useState({
    keys: [],
    preferredDates: [{ date: '', timeSlot: '' }],
    purpose: ''
  });

  const handleDateChange = (index, field, value) => {
    const newDates = [...formData.preferredDates];
    newDates[index][field] = value;
    setFormData({...formData, preferredDates: newDates});
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!formData.purpose.trim()) {
      return toast.error('Please enter a purpose');
    }
    if (formData.keys.length === 0) {
      return toast.error('Please select at least one key');
    }
    if (!formData.preferredDates[0].date || !formData.preferredDates[0].timeSlot) {
      return toast.error('Please select at least one preferred date/time');
    }
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Request failed');
      onClose();
      toast.success('Request submitted successfully!');
    } catch (error) {
      console.error('Request error:', error);
      toast.error('Failed to submit request');
    }
  };

  return (
    <Dialog open={show} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-xs md:max-w-md lg:max-w-2xl bg-white rounded-xl shadow-xl transition-all duration-300 flex flex-col max-h-[90vh]">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <Dialog.Title className="text-lg md:text-xl font-bold text-gray-800">
              New Exchange Request
            </Dialog.Title>
          </div>

          <form onSubmit={handleSubmitRequest} className="flex-1 overflow-y-auto p-4 md:p-6">
            {/* Key Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Keys
              </label>
              <select
                multiple
                className="w-full p-2 border border-gray-300 rounded-lg text-sm h-32 md:h-48 overflow-auto"
                value={formData.keys}
                onChange={e => setFormData({...formData, keys: Array.from(e.target.selectedOptions, o => o.value)})}
              >
                {availableKeys.map(key => (
                  <option
                    key={key._id}
                    value={key._id}
                    className="p-2 text-sm hover:bg-blue-50 border-b border-gray-100"
                  >
                    {key.keyCode} - {key.description} ({key.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Date/Time Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time
              </label>
              {formData.preferredDates.map((date, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <input
                    type="date"
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                    min={new Date().toISOString().split('T')[0]}
                    value={date.date}
                    onChange={(e) => handleDateChange(index, 'date', e.target.value)}
                  />
                  <select
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                    value={date.timeSlot}
                    onChange={(e) => handleDateChange(index, 'timeSlot', e.target.value)}
                  >
                    <option value="">Select Time Slot</option>
                    <option value="morning">Morning (8am-12pm)</option>
                    <option value="afternoon">Afternoon (1pm-5pm)</option>
                  </select>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  preferredDates: [...formData.preferredDates, { date: '', timeSlot: '' }]
                })}
                className="text-blue-600 hover:text-blue-800 text-xs mt-2"
              >
                Add another time slot
              </button>
            </div>
            
            {/* Purpose Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg h-24 text-sm"
                value={formData.purpose}
                onChange={e => setFormData({...formData, purpose: e.target.value})}
              />
            </div>
          </form>

          {/* Sticky Footer with Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 md:p-6">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmitRequest}
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Submit Request
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};;

export default RequestCreationModal;