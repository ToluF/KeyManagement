import { Dialog } from '@headlessui/react';

const RequestModal = ({ requests, onClose, onConvert, onReject }) => {
  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg p-6">
          <Dialog.Title className="text-2xl font-bold mb-4">
            Pending Key Requests
          </Dialog.Title>

          <div className="space-y-4">
            {requests.map(request => (
              <div key={request._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{request.user?.name}</h3>
                    <p className="text-sm text-gray-600">
                      {request.keys.length} keys requested
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Preferred: {request.preferredDates[0]?.date}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onConvert(request._id)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Convert
                    </button>
                    <button
                      onClick={() => onReject(request._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default RequestModal;