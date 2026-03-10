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
      <h1 className="text-2xl font-bold text-white mb-6">Subjects</h1>
      {subjects.length === 0 ? (
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No subjects available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Link key={subject.id} to={`/subjects/${subject.id}`}
              className="bg-navy-900 rounded-xl border border-navy-700 p-6 hover:border-cyan-500/30 hover:bg-navy-800 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs font-medium border border-cyan-500/30">{subject.code}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${subject.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-500/20 text-gray-500 border border-gray-500/30'}`}>
                  {subject.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">{subject.name}</h3>
              <p className="text-sm text-gray-500">{subject.school_code} / {subject.program_code} &middot; Sem {subject.semester}</p>
              <p className="text-sm text-gray-600 mt-2">Faculty: {subject.faculty_name || 'N/A'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
