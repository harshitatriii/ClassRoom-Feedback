import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-navy-700 mb-4">404</h1>
        <p className="text-gray-500 mb-6">Page not found</p>
        <Link to="/" className="text-cyan-400 hover:text-cyan-300 font-medium">Go to Dashboard</Link>
      </div>
    </div>
  );
}
