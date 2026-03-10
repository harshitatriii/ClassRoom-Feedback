import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSubjects } from '../../api/courses';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { BookOpen } from 'lucide-react';

export default function CourseList() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getSubjects()
      .then((res) => setSubjects(res.data.results || res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subjects</h1>
      {subjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">No subjects available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Link key={subject.id} to={`/subjects/${subject.id}`}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{subject.code}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${subject.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {subject.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{subject.name}</h3>
              <p className="text-sm text-gray-500">{subject.school_code} / {subject.program_code} &middot; Sem {subject.semester}</p>
              <p className="text-sm text-gray-400 mt-2">Faculty: {subject.faculty_name || 'N/A'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
