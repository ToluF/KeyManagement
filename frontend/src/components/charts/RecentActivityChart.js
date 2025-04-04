import { Chart as ChartJS, CategoryScale, LinearScale, BarElement } from 'chart.js';


ChartJS.register(CategoryScale, LinearScale, BarElement);

export default function RecentActivityChart({ data }) {
  

  return (
    <div className="mt-4 space-y-2">
      {data.map((activity, index) => (
        <div key={index} className="flex justify-between items-center p-2 border-b">
          <div>
            <p className="font-medium">{activity.keyCode}</p>
            <p className="text-sm text-gray-600">{activity.userName}</p>
          </div>
          <span className="text-sm text-gray-500">
            {new Date(activity.date).toLocaleDateString()}
          </span>
        </div>
      ))}
      {data.length === 0 && (
        <p className="text-center text-gray-500 py-4">No recent activity</p>
      )}
    </div>
  );
}