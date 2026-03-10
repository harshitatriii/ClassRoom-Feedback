import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, BookOpen, MessageSquarePlus,
  History, Settings, GraduationCap, Zap
} from 'lucide-react';

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/student/feedback/new', label: 'Submit Feedback', icon: MessageSquarePlus },
  { to: '/student/feedback', label: 'My Feedback', icon: History },
];

const facultyLinks = [
  { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/subjects', label: 'My Subjects', icon: BookOpen },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/subjects', label: 'Manage Subjects', icon: Settings },
  { to: '/subjects', label: 'All Subjects', icon: BookOpen },
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === 'admin' ? adminLinks
    : user?.role === 'faculty' ? facultyLinks
    : studentLinks;

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-700 flex flex-col">
      <div className="p-4 border-b border-navy-700">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">SmartClass</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:bg-navy-800 hover:text-gray-200'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-navy-700">
        <div className="px-3 py-2 rounded-lg bg-navy-800 text-xs text-gray-500 text-center">
          Smart Classroom v1.0
        </div>
      </div>
    </aside>
  );
}
