import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubject } from '../../api/courses';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function CourseDetail() {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getSubject(id)
      .then((res) => setSubject(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!subject) return <p className="text-gray-500">Subject not found.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-navy-900 rounded-xl border border-navy-700 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm font-medium border border-cyan-500/30">{subject.code}</span>
            <h1 className="text-2xl font-bold text-white mt-2">{subject.name}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${subject.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
            {subject.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">School:</span> <span className="font-medium text-gray-300 ml-1">{subject.program_detail?.school_code || 'N/A'}</span></div>
          <div><span className="text-gray-500">Program:</span> <span className="font-medium text-gray-300 ml-1">{subject.program_detail?.code || 'N/A'}</span></div>
          <div><span className="text-gray-500">Semester:</span> <span className="font-medium text-gray-300 ml-1">{subject.semester}</span></div>
          <div><span className="text-gray-500">Academic Year:</span> <span className="font-medium text-gray-300 ml-1">{subject.academic_year}</span></div>
          <div><span className="text-gray-500">Faculty:</span> <span className="font-medium text-gray-300 ml-1">{subject.faculty_detail?.full_name || 'N/A'}</span></div>
        </div>

        <div className="mt-6 flex gap-3">
          {user?.role === 'student' && (
            <Link to="/student/feedback/new" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-400 hover:to-blue-400 text-sm font-medium shadow-lg shadow-cyan-500/20">
              Submit Feedback
            </Link>
          )}
          {user?.role === 'faculty' && (
            <Link to={`/faculty/analytics/${subject.id}`} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-400 hover:to-blue-400 text-sm font-medium shadow-lg shadow-cyan-500/20">
              View Analytics
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
