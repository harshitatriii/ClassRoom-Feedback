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
  if (!subject) return <p className="text-gray-400">Subject not found.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">{subject.code}</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">{subject.name}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${subject.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {subject.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">School:</span> <span className="font-medium ml-1">{subject.program_detail?.school_code || 'N/A'}</span></div>
          <div><span className="text-gray-500">Program:</span> <span className="font-medium ml-1">{subject.program_detail?.code || 'N/A'}</span></div>
          <div><span className="text-gray-500">Semester:</span> <span className="font-medium ml-1">{subject.semester}</span></div>
          <div><span className="text-gray-500">Academic Year:</span> <span className="font-medium ml-1">{subject.academic_year}</span></div>
          <div><span className="text-gray-500">Faculty:</span> <span className="font-medium ml-1">{subject.faculty_detail?.full_name || 'N/A'}</span></div>
        </div>

        <div className="mt-6 flex gap-3">
          {user?.role === 'student' && (
            <Link to="/student/feedback/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
              Submit Feedback
            </Link>
          )}
          {user?.role === 'faculty' && (
            <Link to={`/faculty/analytics/${subject.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
              View Analytics
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
