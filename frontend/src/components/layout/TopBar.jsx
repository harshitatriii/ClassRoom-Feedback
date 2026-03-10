import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User } from 'lucide-react';

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-navy-900 border-b border-navy-700 px-6 py-3 flex items-center justify-between">
      <div />
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <div className="p-1 rounded-full bg-navy-700">
            <User className="h-4 w-4" />
          </div>
          <span>{user?.first_name || user?.username}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 capitalize border border-cyan-500/30">
            {user?.role}
          </span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
