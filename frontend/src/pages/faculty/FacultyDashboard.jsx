import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../api/dashboard';
import { getSubjects } from '../../api/courses';
import StatCard from '../../components/ui/StatCard';
import SentimentPieChart from '../../components/charts/SentimentPieChart';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { MessageSquare, BookOpen, TrendingUp, BarChart3 } from 'lucide-react';

export default function FacultyDashboard() {
  const [stats, setStats] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getSubjects(),
    ]).then(([statsRes, subjectsRes]) => {
      setStats(statsRes.data);
      setSubjects(subjectsRes.data.results || subjectsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const sentimentData = stats?.sentiment_distribution ? [
    { name: 'Positive', value: stats.sentiment_distribution.positive },
    { name: 'Neutral', value: stats.sentiment_distribution.neutral },
    { name: 'Negative', value: stats.sentiment_distribution.negative },
  ] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Faculty Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={MessageSquare} label="Total Feedback" value={stats?.total_feedback || 0} color="cyan" />
        <StatCard icon={BookOpen} label="Subjects" value={stats?.subjects_count || 0} color="green" />
        <StatCard icon={TrendingUp} label="Avg Sentiment" value={stats?.avg_sentiment?.toFixed(2)} color="purple" />
        <StatCard icon={BarChart3} label="Avg Rating" value={stats?.avg_rating?.toFixed(1)} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Sentiment Distribution</h2>
          <SentimentPieChart data={sentimentData} />
        </div>

        <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">My Subjects</h2>
          {subjects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No subjects assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {subjects.map((subject) => (
                <Link key={subject.id} to={`/faculty/analytics/${subject.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-navy-700 hover:border-cyan-500/30 hover:bg-navy-800 transition-all">
                  <div>
                    <p className="font-medium text-white">{subject.name}</p>
                    <p className="text-sm text-gray-500">{subject.code} &middot; Sem {subject.semester}</p>
                  </div>
                  <span className="text-sm text-cyan-400 font-medium">View Analytics &rarr;</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
