import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../api/dashboard';
import { getFeedbackList, getMyCampaignStatus } from '../../api/feedback';
import { getSubjects } from '../../api/courses';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { MessageSquare, BookOpen, Star, MessageSquarePlus, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getFeedbackList(),
      getSubjects({ is_active: 'true' }),
      getMyCampaignStatus().catch(() => ({ data: [] })),
    ]).then(([statsRes, fbRes, subjectsRes, campRes]) => {
      setStats(statsRes.data);
      setRecentFeedback((fbRes.data.results || fbRes.data).slice(0, 5));
      setSubjects(subjectsRes.data.results || subjectsRes.data);
      setCampaigns(campRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  // Subjects the student has already given feedback on
  const feedbackSubjectIds = new Set(recentFeedback.map(fb => fb.subject));
  const pendingSubjects = subjects.filter(s => !feedbackSubjectIds.has(s.id));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>

      {/* Active campaign banners */}
      {campaigns.map(c => (
        <div key={c.campaign.id}
          className={`rounded-xl border p-4 ${
            c.completion_percentage >= 100
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : c.campaign.is_mandatory
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-purple-500/10 border-purple-500/30'
          }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {c.completion_percentage >= 100 ? (
                <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              ) : c.campaign.is_mandatory ? (
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              ) : (
                <Calendar className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold text-white">
                  {c.campaign.title}
                  {c.campaign.is_mandatory && c.completion_percentage < 100 && (
                    <span className="ml-2 text-xs text-red-400">(Mandatory)</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {c.completion_percentage >= 100
                    ? 'All feedback submitted - thank you!'
                    : `${c.completed_subjects}/${c.total_subjects} subjects completed`
                  }
                  {' · '}Ends {new Date(c.campaign.end_date).toLocaleDateString()}
                </p>
                {c.completion_percentage < 100 && c.pending_subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {c.pending_subjects.map(s => (
                      <Link key={s.id} to="/student/feedback/new"
                        className="px-2 py-0.5 text-xs rounded-full bg-navy-800 border border-navy-600 text-gray-300 hover:border-cyan-500/40 hover:text-cyan-400 transition-all">
                        {s.code}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right min-w-[4rem]">
              <p className={`text-lg font-bold ${
                c.completion_percentage >= 100 ? 'text-emerald-400' : 'text-white'
              }`}>
                {c.completion_percentage}%
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-navy-800 rounded-full h-1.5 mt-3">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                c.completion_percentage >= 100
                  ? 'bg-emerald-400'
                  : c.campaign.is_mandatory
                  ? 'bg-gradient-to-r from-red-500 to-pink-500'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500'
              }`}
              style={{ width: `${Math.min(c.completion_percentage, 100)}%` }}
            ></div>
          </div>
        </div>
      ))}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Available Subjects" value={stats?.subjects_count || 0} color="cyan" />
        <StatCard icon={MessageSquare} label="Feedback Given" value={stats?.total_feedback || 0} color="blue" />
        <StatCard icon={CheckCircle} label="Pending Feedback" value={pendingSubjects.length} color="yellow" />
        <StatCard icon={Star} label="Avg Rating Given" value={stats?.avg_rating?.toFixed(1)} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Subjects */}
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Your Subjects</h2>
            <Link to="/subjects" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">View All &rarr;</Link>
          </div>
          {subjects.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No subjects available for your program & semester.</p>
          ) : (
            <div className="space-y-2">
              {subjects.map((subject) => {
                const hasFeedback = feedbackSubjectIds.has(subject.id);
                return (
                  <Link key={subject.id} to={hasFeedback ? `/feedback/${recentFeedback.find(fb => fb.subject === subject.id)?.id}` : '/student/feedback/new'}
                    className="flex items-center justify-between p-3 rounded-lg border border-navy-700 hover:border-cyan-500/30 hover:bg-navy-800 transition-all">
                    <div>
                      <p className="font-medium text-white text-sm">{subject.name}</p>
                      <p className="text-xs text-gray-500">{subject.code} &middot; {subject.faculty_name || 'N/A'}</p>
                    </div>
                    {hasFeedback ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Done</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">Pending</span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Feedback */}
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
    </div>
  );
}
