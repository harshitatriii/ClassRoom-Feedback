import { useState, useEffect } from 'react';
import { createSubject, updateSubject, getSchools, getPrograms } from '../../api/courses';
import toast from 'react-hot-toast';

export default function CourseForm({ subject, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: '', code: '', program: '', semester: 1,
    faculty: '', academic_year: '', is_active: true,
  });
  const [schools, setSchools] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSchools().then(res => setSchools(res.data.results || res.data));
  }, []);

  useEffect(() => {
    if (selectedSchool) {
      getPrograms({ school: selectedSchool }).then(res => {
        setPrograms(res.data.results || res.data);
      });
    } else {
      setPrograms([]);
    }
  }, [selectedSchool]);

  useEffect(() => {
    if (subject) {
      setForm({
        name: subject.name || '',
        code: subject.code || '',
        program: subject.program || subject.program_detail?.id || '',
        semester: subject.semester || 1,
        faculty: subject.faculty || subject.faculty_detail?.id || '',
        academic_year: subject.academic_year || '',
        is_active: subject.is_active !== false,
      });
      if (subject.program_detail?.school) {
        setSelectedSchool(subject.program_detail.school);
      } else if (subject.school_code) {
        getSchools().then(res => {
          const s = (res.data.results || res.data).find(s => s.code === subject.school_code);
          if (s) setSelectedSchool(s.id);
        });
      }
    }
  }, [subject]);

  const selectedProgram = programs.find(p => p.id === parseInt(form.program));
  const maxSemester = selectedProgram?.total_semesters || 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        semester: parseInt(form.semester),
        faculty: parseInt(form.faculty),
        program: parseInt(form.program),
      };
      if (subject) {
        await updateSubject(subject.id, payload);
        toast.success('Subject updated');
      } else {
        await createSubject(payload);
        toast.success('Subject created');
      }
      onSaved();
    } catch (err) {
      const msg = Object.entries(err.response?.data || {})
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join('; ') || 'Failed to save subject';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors";
  const selectClass = "w-full px-4 py-2.5 bg-navy-800 border border-navy-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <form onSubmit={handleSubmit} className="bg-navy-900 rounded-xl border border-navy-700 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">{subject ? 'Edit Subject' : 'Add New Subject'}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject Code *</label>
          <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="e.g. CS401"
            className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">School *</label>
          <select required value={selectedSchool} onChange={(e) => {
            setSelectedSchool(e.target.value);
            setForm({ ...form, program: '' });
          }}
            className={selectClass}>
            <option value="">Select School</option>
            {schools.map(s => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Program *</label>
          <select required value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })}
            disabled={!selectedSchool}
            className={selectClass}>
            <option value="">Select Program</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Semester *</label>
          <input type="number" required min={1} max={maxSemester} value={form.semester}
            onChange={(e) => setForm({ ...form, semester: e.target.value })}
            className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Faculty ID (user ID) *</label>
          <input type="number" required value={form.faculty}
            onChange={(e) => setForm({ ...form, faculty: e.target.value })}
            placeholder="Enter faculty user ID"
            className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Academic Year *</label>
          <input required value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
            placeholder="e.g. 2025-26"
            className={inputClass} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_active" checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          className="rounded border-navy-600 bg-navy-800 text-cyan-500 focus:ring-cyan-500" />
        <label htmlFor="is_active" className="text-sm text-gray-400">Active</label>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 text-sm font-medium shadow-lg shadow-cyan-500/20">
          {loading ? 'Saving...' : (subject ? 'Update' : 'Create')}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2 rounded-lg border border-navy-600 text-gray-400 hover:bg-navy-800 hover:text-white text-sm transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
