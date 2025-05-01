import { ExclamationCircleIcon, ClockIcon } from '@heroicons/react/outline';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function LostKeyItem({ keyData, onMarkFound }) {
    const navigate = useNavigate();
    const lostEntry = keyData.transactionHistory?.find(
        t => t.status === 'lost'
      );

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-4 border-l-4 border-red-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              {keyData.keyCode || 'Unknown Key'}
            </h3>
          <span className="ml-2 text-sm text-gray-500">
              ({keyData.location})
            </span>
          </div>

          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>
              Marked lost on: {lostEntry?.date ? new Date(lostEntry.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Date not available'}
            </span>
          </div>

          {lostEntry?.transaction && (
            <div className="text-sm text-gray-600">
              Related transaction: {lostEntry.transaction._id}
            </div>
          )}
        </div>
        
        <div className="ml-4 flex flex-col gap-2 ">
          <button
            onClick={onMarkFound}
            className="px-3 py-1.5 text-sm font-medium bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
          >
            Mark Found
          </button>
          <button
            onClick={() => navigate(`/inventory/history/${keyData._id}`)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
}