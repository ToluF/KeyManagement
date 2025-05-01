export default function RecentActivity({ activities }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
      
      {activities.length === 0 ? (
        <p className="text-gray-500">No recent activity</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity._id}
              className="flex items-start gap-4 p-3 border-b last:border-b-0 hover:bg-gray-50"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-sm">
                  {(activity.items || []).some(i => i?.status === 'returned') ? '✓' : '→'}
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">
                  {(activity.items || [])
                      .map(item => item?.key?.keyCode || 'Unknown Key')
                      .join(', ')}
                  </span>
                  <span 
                    className={`px-2 py-1 text-xs rounded-full ${
                      activity.status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <span className="block sm:inline-block">
                    {formatDate(activity.checkoutDate)} • 
                  </span>
                  <span className="text-gray-500">
                    {getTimeAgo(activity.checkoutDate)} • {activity.user?.name || 'System'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}