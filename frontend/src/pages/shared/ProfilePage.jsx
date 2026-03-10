import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from '../../api/auth';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile(form);
      setUser(res.data);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors";

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>
      <div className="bg-navy-900 rounded-xl border border-navy-700 p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-navy-700">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/20">
            {(user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">{user?.username}</p>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 capitalize border border-cyan-500/30">{user?.role}</span>
            {user?.enrollment_no && <span className="text-xs text-gray-500 ml-2">EN: {user.enrollment_no}</span>}
            {user?.faculty_id && <span className="text-xs text-gray-500 ml-2">FID: {user.faculty_id}</span>}
          </div>
        </div>

        <div className="mb-6 p-4 bg-navy-800 rounded-lg space-y-2 text-sm border border-navy-700">
          <div className="flex justify-between">
            <span className="text-gray-500">School</span>
            <span className="font-medium text-gray-300">{user?.school_detail?.code ? `${user.school_detail.code} - ${user.school_detail.name}` : 'N/A'}</span>
          </div>
          {user?.role === 'student' && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-500">Program</span>
                <span className="font-medium text-gray-300">{user?.program_detail?.code ? `${user.program_detail.code} - ${user.program_detail.name}` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current Semester</span>
                <span className="font-medium text-gray-300">{user?.current_semester || 'N/A'}</span>
              </div>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">First Name</label>
              <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Last Name</label>
              <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2.5 rounded-lg hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 font-semibold shadow-lg shadow-cyan-500/20">
            {loading ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
