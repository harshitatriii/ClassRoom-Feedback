import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../api/dashboard';
import { getFeedbackList } from '../../api/feedback';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { MessageSquare, BookOpen, Star, MessageSquarePlus } from 'lucide-react';

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getFeedbackList(),
    ]).then(([statsRes, fbRes]) => {
      setStats(statsRes.data);
      setRecentFeedback((fbRes.data.results || fbRes.data).slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={MessageSquare} label="Feedback Submitted" value={stats?.total_feedback || 0} color="cyan" />
        <StatCard icon={BookOpen} label="Subjects" value={stats?.subjects_count || 0} color="green" />
        <StatCard icon={Star} label="Avg Rating Given" value={stats?.avg_rating?.toFixed(1)} color="yellow" />
      </div>

      <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Feedback</h2>
          <Link to="/student/feedback/new"
            className="flex items-center gap-1 text-sm bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20">
            <MessageSquarePlus className="h-4 w-4" /> Submit New
          </Link>
        </div>
        {recentFeedback.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No feedback submitted yet. Start by submitting feedback for a subject!</p>
        ) : (
          <div className="space-y-3">
            {recentFeedback.map((fb) => (
              <Link key={fb.id} to={`/feedback/${fb.id}`}
                className="block p-4 rounded-lg border border-navy-700 hover:border-cyan-500/30 hover:bg-navy-800 transition-all">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-white">{fb.subject_detail?.name || 'Subject'}</p>
                    <p className="text-sm text-gray-500">{fb.subject_detail?.code}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-white">{fb.rating_overall}/5</span>
                    </div>
                    <p className="text-xs text-gray-500">{new Date(fb.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
