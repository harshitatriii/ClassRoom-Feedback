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
        <h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
        <button onClick={() => { setEditingSubject(null); setShowForm(true); }}
          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Code</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">School</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Program</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">Semester</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Faculty</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">Active</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{s.code}</td>
                <td className="py-3 px-4">{s.name}</td>
                <td className="py-3 px-4 text-gray-600">{s.school_code}</td>
                <td className="py-3 px-4 text-gray-600">{s.program_code}</td>
                <td className="py-3 px-4 text-center">{s.semester}</td>
                <td className="py-3 px-4 text-gray-600">{s.faculty_name || s.faculty_detail?.full_name}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.is_active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => { setEditingSubject(s); setShowForm(true); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(s.id, s.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subjects.length === 0 && (
          <p className="text-gray-400 text-center py-8">No subjects yet. Click "Add Subject" to create one.</p>
        )}
      </div>
    </div>
  );
}
