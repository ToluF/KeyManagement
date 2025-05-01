import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">⛔ Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <Link 
          to="/dashboard" 
          className="text-blue-600 hover:underline font-medium"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}