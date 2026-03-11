import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubjectAnalytics, exportFeedbackCSV } from '../../api/dashboard';
import { getFeedbackList } from '../../api/feedback';
import SentimentPieChart from '../../components/charts/SentimentPieChart';
import RatingBarChart from '../../components/charts/RatingBarChart';
import TrendLineChart from '../../components/charts/TrendLineChart';
import KeywordCloud from '../../components/charts/KeywordCloud';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Download, MessageCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function CourseAnalytics() {
  const { subjectId } = useParams();
  const [data, setData] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSubjectAnalytics(subjectId),
      getFeedbackList({ subject: subjectId }),
    ]).then(([analyticsRes, fbRes]) => {
      setData(analyticsRes.data);
      setFeedbacks(fbRes.data.results || fbRes.data);
    }).finally(() => setLoading(false));
  }, [subjectId]);

  const handleExport = async () => {
    try {
      const res = await exportFeedbackCSV({ subject: subjectId });
      downloadBlob(new Blob([res.data]), `feedback_${data?.subject?.code || subjectId}.csv`);
      toast.success('Report downloaded');
    } catch { toast.error('Export failed'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <p className="text-gray-500">Failed to load analytics.</p>;

  const sentimentData = [
    { name: 'Positive', value: data.sentiment_distribution.positive },
    { name: 'Neutral', value: data.sentiment_distribution.neutral },
    { name: 'Negative', value: data.sentiment_distribution.negative },
  ];

  const ratingData = [
    { category: 'Teaching', average: data.ratings.avg_teaching || 0 },
    { category: 'Content', average: data.ratings.avg_content || 0 },
    { category: 'Engagement', average: data.ratings.avg_engagement || 0 },
    { category: 'Overall', average: data.ratings.avg_overall || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">{data.subject.name}</h1>
          <p className="text-gray-400">{data.subject.code} &middot; {data.ratings.total_count} feedback submissions</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-800 border border-navy-600 rounded-lg text-sm text-gray-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Sentiment Distribution</h2>
          <SentimentPieChart data={sentimentData} />
        </div>
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Rating Breakdown</h2>
          <RatingBarChart data={ratingData} />
        </div>
      </div>

      <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Sentiment Trend</h2>
        <TrendLineChart data={data.trends?.filter(t => t.polarity !== null)} />
      </div>

      <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Top Keywords</h2>
        <KeywordCloud keywords={data.keywords} />
      </div>

      {/* Feedback List with Response Status */}
      <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">All Feedback</h2>
        {feedbacks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No feedback yet.</p>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((fb) => (
              <Link key={fb.id} to={`/feedback/${fb.id}`}
                className="flex items-center justify-between p-4 rounded-lg border border-navy-700 hover:border-cyan-500/30 hover:bg-navy-800 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{fb.text_feedback || 'No written feedback'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {fb.student_info?.full_name || 'Anonymous'} &middot; {new Date(fb.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-white">{fb.rating_overall}</span>
                  </div>
                  {fb.sentiment && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      fb.sentiment.sentiment_label === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                      fb.sentiment.sentiment_label === 'negative' ? 'bg-red-500/20 text-red-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {fb.sentiment.sentiment_label}
                    </span>
                  )}
                  {fb.response ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      <MessageCircle className="h-3 w-3" /> Replied
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-navy-700 text-gray-500">
                      No reply
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
