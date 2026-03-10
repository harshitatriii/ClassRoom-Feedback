import { useState, useEffect } from 'react';
import { getSubjects, deleteSubject } from '../../api/courses';
import CourseForm from './CourseForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function CourseManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const fetchSubjects = () => {
    setLoading(true);
    getSubjects()
      .then((res) => setSubjects(res.data.results || res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete subject "${name}"?`)) return;
    try {
      await deleteSubject(id);
      toast.success('Subject deleted');
      fetchSubjects();
    } catch {
      toast.error('Failed to delete subject');
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingSubject(null);
    fetchSubjects();
  };

  if (loading && subjects.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Subject Management</h1>
        <button onClick={() => { setEditingSubject(null); setShowForm(true); }}
          className="flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-400 hover:to-blue-400 text-sm font-medium shadow-lg shadow-cyan-500/20">
          <Plus className="h-4 w-4" /> Add Subject
        </button>
      </div>

      {showForm && (
        <CourseForm
          subject={editingSubject}
          onSaved={handleSaved}
          onCancel={() => { setShowForm(false); setEditingSubject(null); }}
        />
      )}

      <div className="bg-navy-900 rounded-xl border border-navy-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-600 bg-navy-800">
              <th className="text-left py-3 px-4 font-medium text-gray-400">Code</th>
              <th className="text-left py-3 px-4 font-medium text-gray-400">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-400">School</th>
              <th className="text-left py-3 px-4 font-medium text-gray-400">Program</th>
              <th className="text-center py-3 px-4 font-medium text-gray-400">Semester</th>
              <th className="text-left py-3 px-4 font-medium text-gray-400">Faculty</th>
              <th className="text-center py-3 px-4 font-medium text-gray-400">Active</th>
              <th className="text-center py-3 px-4 font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id} className="border-b border-navy-700/50 hover:bg-navy-800 transition-colors">
                <td className="py-3 px-4 font-medium text-cyan-400">{s.code}</td>
                <td className="py-3 px-4 text-white">{s.name}</td>
                <td className="py-3 px-4 text-gray-400">{s.school_code}</td>
                <td className="py-3 px-4 text-gray-400">{s.program_code}</td>
                <td className="py-3 px-4 text-center text-gray-300">{s.semester}</td>
                <td className="py-3 px-4 text-gray-400">{s.faculty_name || s.faculty_detail?.full_name}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                    {s.is_active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => { setEditingSubject(s); setShowForm(true); }}
                      className="p-1.5 text-gray-500 hover:text-cyan-400 transition-colors"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(s.id, s.name)}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subjects.length === 0 && (
          <p className="text-gray-500 text-center py-8">No subjects yet. Click "Add Subject" to create one.</p>
        )}
      </div>
    </div>
  );
}
