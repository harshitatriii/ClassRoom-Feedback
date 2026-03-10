import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/auth';
import { getSchools, getPrograms } from '../../api/courses';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Zap } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    role: 'student', school: '', program: '', current_semester: '',
    enrollment_no: '', faculty_id: '', phone: '', password: '', password2: '',
  });
  const [schools, setSchools] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    getSchools().then(res => setSchools(res.data.results || res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.school) {
      getPrograms({ school: form.school }).then(res => {
        setPrograms(res.data.results || res.data);
      }).catch(() => {});
    } else {
      setPrograms([]);
    }
    setForm(prev => ({ ...prev, program: '', current_semester: '' }));
  }, [form.school]);

  const selectedProgram = programs.find(p => p.id === parseInt(form.program));
  const semesterOptions = selectedProgram
    ? Array.from({ length: selectedProgram.total_semesters }, (_, i) => i + 1)
    : [];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const payload = { ...form };
      if (payload.school) payload.school = parseInt(payload.school);
      if (payload.program) payload.program = parseInt(payload.program);
      if (payload.current_semester) payload.current_semester = parseInt(payload.current_semester);
      const res = await registerUser(payload);
      localStorage.setItem('token', res.data.token);
      await login({ username: form.username, password: form.password });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        setErrors(data);
      }
      toast.error('Registration failed. Check the form for errors.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 bg-navy-800 border rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors ${
      errors[field] ? 'border-red-500/50' : 'border-navy-600'
    }`;

  const selectClass = (field) =>
    `w-full px-4 py-2.5 bg-navy-800 border rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
      errors[field] ? 'border-red-500/50' : 'border-navy-600'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4 py-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl mb-4 shadow-lg shadow-cyan-500/20">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-gray-400 mt-1">Join Smart Classroom Feedback System</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-navy-900 rounded-2xl border border-navy-700 p-8 space-y-4 shadow-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">First Name</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} className={inputClass('first_name')} placeholder="First name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Last Name</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} className={inputClass('last_name')} placeholder="Last name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Username *</label>
            <input name="username" required value={form.username} onChange={handleChange} className={inputClass('username')} placeholder="Choose a username" />
            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email *</label>
            <input name="email" type="email" required value={form.email} onChange={handleChange} className={inputClass('email')} placeholder="your@email.com" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Role *</label>
            <select name="role" value={form.role} onChange={handleChange} className={selectClass('role')}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">School *</label>
            <select name="school" value={form.school} onChange={handleChange} className={selectClass('school')}>
              <option value="">Select School</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>
            {errors.school && <p className="text-red-400 text-xs mt-1">{errors.school}</p>}
          </div>
          {form.role === 'student' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Program *</label>
                <select name="program" value={form.program} onChange={handleChange} className={selectClass('program')} disabled={!form.school}>
                  <option value="">Select Program</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
                {errors.program && <p className="text-red-400 text-xs mt-1">{errors.program}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Current Semester *</label>
                <select name="current_semester" value={form.current_semester} onChange={handleChange} className={selectClass('current_semester')} disabled={!form.program}>
                  <option value="">Select Semester</option>
                  {semesterOptions.map(n => (
                    <option key={n} value={n}>Semester {n}</option>
                  ))}
                </select>
                {errors.current_semester && <p className="text-red-400 text-xs mt-1">{errors.current_semester}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Enrollment Number *</label>
                <input name="enrollment_no" required value={form.enrollment_no} onChange={handleChange} className={inputClass('enrollment_no')} placeholder="e.g. EN2024001" />
                {errors.enrollment_no && <p className="text-red-400 text-xs mt-1">{errors.enrollment_no}</p>}
              </div>
            </>
          )}
          {form.role === 'faculty' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Faculty ID *</label>
              <input name="faculty_id" required value={form.faculty_id} onChange={handleChange} className={inputClass('faculty_id')} placeholder="e.g. FAC001" />
              {errors.faculty_id && <p className="text-red-400 text-xs mt-1">{errors.faculty_id}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className={inputClass('phone')} placeholder="Optional" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password *</label>
              <input name="password" type="password" required value={form.password} onChange={handleChange} className={inputClass('password')} placeholder="Min 8 characters" />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password *</label>
              <input name="password2" type="password" required value={form.password2} onChange={handleChange} className={inputClass('password2')} placeholder="Confirm password" />
              {errors.password2 && <p className="text-red-400 text-xs mt-1">{errors.password2}</p>}
            </div>
          </div>
          {errors.non_field_errors && (
            <p className="text-red-400 text-sm">{errors.non_field_errors}</p>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2.5 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50 font-semibold shadow-lg shadow-cyan-500/20">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
