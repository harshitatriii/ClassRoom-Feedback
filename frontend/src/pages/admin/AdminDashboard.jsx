import { useState, useEffect } from 'react';
import { getDashboardStats, getSchoolAnalytics } from '../../api/dashboard';
import { getSchools } from '../../api/courses';
import StatCard from '../../components/ui/StatCard';
import SentimentPieChart from '../../components/charts/SentimentPieChart';
import RatingBarChart from '../../components/charts/RatingBarChart';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Users, MessageSquare, BookOpen, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [subjectData, setSubjectData] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getSchoolAnalytics(),
      getSchools(),
    ]).then(([statsRes, analyticsRes, schoolsRes]) => {
      setStats(statsRes.data);
      setSubjectData(analyticsRes.data.subjects || []);
      setSchools(schoolsRes.data.results || schoolsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedSchool) {
      getSchoolAnalytics({ school: selectedSchool }).then(res => {
        setSubjectData(res.data.subjects || []);
      });
    } else {
      getSchoolAnalytics().then(res => {
        setSubjectData(res.data.subjects || []);
      });
    }
  }, [selectedSchool]);

  if (loading) return <LoadingSpinner />;

  const sentimentData = stats?.sentiment_distribution ? [
    { name: 'Positive', value: stats.sentiment_distribution.positive },
    { name: 'Neutral', value: stats.sentiment_distribution.neutral },
    { name: 'Negative', value: stats.sentiment_distribution.negative },
  ] : [];

  const subjectRatings = subjectData
    .filter(c => c.avg_overall_rating)
    .map(c => ({ category: c.subject_code, average: c.avg_overall_rating }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats?.total_users || 0} color="purple" />
        <StatCard icon={MessageSquare} label="Total Feedback" value={stats?.total_feedback || 0} color="cyan" />
        <StatCard icon={BookOpen} label="Total Subjects" value={stats?.total_subjects || 0} color="green" />
        <StatCard icon={TrendingUp} label="Avg Sentiment" value={stats?.avg_sentiment?.toFixed(2)} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Overall Sentiment</h2>
          <SentimentPieChart data={sentimentData} />
        </div>
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Subject Ratings Comparison</h2>
          <RatingBarChart data={subjectRatings} />
        </div>
      </div>

      <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">School Overview</h2>
          <select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}
            className="px-3 py-1.5 bg-navy-800 border border-navy-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none">
            <option value="">All Schools</option>
            {schools.map(s => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>
        </div>
        {subjectData.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No subject data available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-600">
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Faculty</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">School</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Program</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-400">Sem</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-400">Feedback</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-400">Avg Rating</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-400">Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {subjectData.map((c) => (
                  <tr key={c.subject_id} className="border-b border-navy-700/50 hover:bg-navy-800 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">{c.subject_code} - {c.subject_name}</td>
                    <td className="py-3 px-4 text-gray-400">{c.faculty_name}</td>
                    <td className="py-3 px-4 text-gray-400">{c.school_code}</td>
                    <td className="py-3 px-4 text-gray-400">{c.program_code}</td>
                    <td className="py-3 px-4 text-center text-gray-300">{c.semester}</td>
                    <td className="py-3 px-4 text-center text-gray-300">{c.feedback_count}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-amber-400 font-medium">{c.avg_overall_rating?.toFixed(1) || '--'}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-cyan-400 font-medium">{c.avg_polarity?.toFixed(2) || '--'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
