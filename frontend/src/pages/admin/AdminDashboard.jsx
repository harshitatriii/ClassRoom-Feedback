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
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats?.total_users || 0} color="purple" />
        <StatCard icon={MessageSquare} label="Total Feedback" value={stats?.total_feedback || 0} color="blue" />
        <StatCard icon={BookOpen} label="Total Subjects" value={stats?.total_subjects || 0} color="green" />
        <StatCard icon={TrendingUp} label="Avg Sentiment" value={stats?.avg_sentiment?.toFixed(2)} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Sentiment</h2>
          <SentimentPieChart data={sentimentData} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Ratings Comparison</h2>
          <RatingBarChart data={subjectRatings} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">School Overview</h2>
          <select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All Schools</option>
            {schools.map(s => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>
        </div>
        {subjectData.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No subject data available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Faculty</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">School</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Program</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Sem</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Feedback</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Avg Rating</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {subjectData.map((c) => (
                  <tr key={c.subject_id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{c.subject_code} - {c.subject_name}</td>
                    <td className="py-3 px-4 text-gray-600">{c.faculty_name}</td>
                    <td className="py-3 px-4 text-gray-600">{c.school_code}</td>
                    <td className="py-3 px-4 text-gray-600">{c.program_code}</td>
                    <td className="py-3 px-4 text-center">{c.semester}</td>
                    <td className="py-3 px-4 text-center">{c.feedback_count}</td>
                    <td className="py-3 px-4 text-center">{c.avg_overall_rating?.toFixed(1) || '--'}</td>
                    <td className="py-3 px-4 text-center">{c.avg_polarity?.toFixed(2) || '--'}</td>
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
