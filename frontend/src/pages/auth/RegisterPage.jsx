import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/auth';
import { getSchools, getPrograms } from '../../api/courses';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { GraduationCap } from 'lucide-react';

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
    getSchools().then(res => setSchools(res.data.results || res.data));
  }, []);

  useEffect(() => {
    if (form.school) {
      getPrograms({ school: form.school }).then(res => {
        setPrograms(res.data.results || res.data);
      });
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
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <GraduationCap className="h-12 w-12 text-blue-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500">Join Smart Classroom Feedback System</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} className={inputClass('first_name')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} className={inputClass('last_name')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input name="username" required value={form.username} onChange={handleChange} className={inputClass('username')} />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input name="email" type="email" required value={form.email} onChange={handleChange} className={inputClass('email')} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select name="role" value={form.role} onChange={handleChange} className={inputClass('role')}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
            <select name="school" value={form.school} onChange={handleChange} className={inputClass('school')}>
              <option value="">Select School</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>
            {errors.school && <p className="text-red-500 text-xs mt-1">{errors.school}</p>}
          </div>
          {form.role === 'student' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
                <select name="program" value={form.program} onChange={handleChange} className={inputClass('program')} disabled={!form.school}>
                  <option value="">Select Program</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
                {errors.program && <p className="text-red-500 text-xs mt-1">{errors.program}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester *</label>
                <select name="current_semester" value={form.current_semester} onChange={handleChange} className={inputClass('current_semester')} disabled={!form.program}>
                  <option value="">Select Semester</option>
                  {semesterOptions.map(n => (
                    <option key={n} value={n}>Semester {n}</option>
                  ))}
                </select>
                {errors.current_semester && <p className="text-red-500 text-xs mt-1">{errors.current_semester}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Number *</label>
                <input name="enrollment_no" required value={form.enrollment_no} onChange={handleChange} className={inputClass('enrollment_no')} />
                {errors.enrollment_no && <p className="text-red-500 text-xs mt-1">{errors.enrollment_no}</p>}
              </div>
            </>
          )}
          {form.role === 'faculty' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faculty ID *</label>
              <input name="faculty_id" required value={form.faculty_id} onChange={handleChange} className={inputClass('faculty_id')} />
              {errors.faculty_id && <p className="text-red-500 text-xs mt-1">{errors.faculty_id}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className={inputClass('phone')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input name="password" type="password" required value={form.password} onChange={handleChange} className={inputClass('password')} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input name="password2" type="password" required value={form.password2} onChange={handleChange} className={inputClass('password2')} />
              {errors.password2 && <p className="text-red-500 text-xs mt-1">{errors.password2}</p>}
            </div>
          </div>
          {errors.non_field_errors && (
            <p className="text-red-500 text-sm">{errors.non_field_errors}</p>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
