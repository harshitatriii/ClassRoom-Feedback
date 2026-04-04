import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from '../../api/auth';
import { getSchools, getPrograms } from '../../api/courses';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const needsSetup = user?.role === 'student' && (!user?.school || !user?.program || !user?.current_semester || !user?.enrollment_no);

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    school: user?.school || '',
    program: user?.program || '',
    current_semester: user?.current_semester || '',
    enrollment_no: user?.enrollment_no || '',
    faculty_id: user?.faculty_id || '',
  });
  const [schools, setSchools] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (needsSetup || user?.role === 'faculty') {
      getSchools().then(res => setSchools(res.data.results || res.data)).catch(() => {});
    }
  }, [needsSetup, user?.role]);

  useEffect(() => {
    if (form.school) {
      getPrograms({ school: form.school }).then(res => {
        setPrograms(res.data.results || res.data);
      }).catch(() => {});
    } else {
      setPrograms([]);
    }
  }, [form.school]);

  const selectedProgram = programs.find(p => p.id === parseInt(form.program));
  const semesterOptions = selectedProgram
    ? Array.from({ length: selectedProgram.total_semesters }, (_, i) => i + 1)
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'school') {
        updated.program = '';
        updated.current_semester = '';
      }
      if (name === 'program') {
        updated.current_semester = '';
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.school) payload.school = parseInt(payload.school);
      else delete payload.school;
      if (payload.program) payload.program = parseInt(payload.program);
      else delete payload.program;
      if (payload.current_semester) payload.current_semester = parseInt(payload.current_semester);
      else delete payload.current_semester;
      if (!payload.enrollment_no) delete payload.enrollment_no;
      if (!payload.faculty_id) delete payload.faculty_id;

      const res = await updateProfile(payload);
      setUser(res.data);
      toast.success('Profile updated');
    } catch (err) {
      const data = err.response?.data;
      const msg = typeof data === 'object'
        ? Object.values(data).flat().join(', ')
        : 'Failed to update profile';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors";
  const selectClass = "w-full px-4 py-2.5 bg-navy-800 border border-navy-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors disabled:opacity-50";

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

      {needsSetup && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-sm">
          Please complete your profile by selecting your school, program, semester, and enrollment number to access your subjects.
        </div>
      )}

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

        {/* Show academic info as read-only if already set */}
        {!needsSetup && user?.role === 'student' && (
          <div className="mb-6 p-4 bg-navy-800 rounded-lg space-y-2 text-sm border border-navy-700">
            <div className="flex justify-between">
              <span className="text-gray-500">School</span>
              <span className="font-medium text-gray-300">{user?.school_detail?.code} - {user?.school_detail?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Program</span>
              <span className="font-medium text-gray-300">{user?.program_detail?.code} - {user?.program_detail?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Current Semester</span>
              <span className="font-medium text-gray-300">Semester {user?.current_semester}</span>
            </div>
          </div>
        )}

        {user?.role === 'faculty' && user?.school_detail && (
          <div className="mb-6 p-4 bg-navy-800 rounded-lg space-y-2 text-sm border border-navy-700">
            <div className="flex justify-between">
              <span className="text-gray-500">School</span>
              <span className="font-medium text-gray-300">{user?.school_detail?.code} - {user?.school_detail?.name}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">First Name</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Last Name</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input type="email" value={form.email} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
          </div>

          {/* Academic fields — editable only if not yet set */}
          {needsSetup && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">School *</label>
                <select name="school" value={form.school} onChange={handleChange} className={selectClass}>
                  <option value="">Select School</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Program *</label>
                <select name="program" value={form.program} onChange={handleChange} className={selectClass} disabled={!form.school}>
                  <option value="">Select Program</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Current Semester *</label>
                <select name="current_semester" value={form.current_semester} onChange={handleChange} className={selectClass} disabled={!form.program}>
                  <option value="">Select Semester</option>
                  {semesterOptions.map(n => (
                    <option key={n} value={n}>Semester {n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Enrollment Number *</label>
                <input name="enrollment_no" value={form.enrollment_no} onChange={handleChange} className={inputClass} placeholder="e.g. 2201010024" />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="Optional" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2.5 rounded-lg hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 font-semibold shadow-lg shadow-cyan-500/20">
            {loading ? 'Saving...' : needsSetup ? 'Complete Profile' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
