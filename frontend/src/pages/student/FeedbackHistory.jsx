import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeedbackList } from '../../api/feedback';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Star, ChevronRight } from 'lucide-react';

export default function FeedbackHistory() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeedbackList()
      .then((res) => setFeedbacks(res.data.results || res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Feedback History</h1>
      {feedbacks.length === 0 ? (
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-12 text-center">
          <p className="text-gray-500 mb-4">You haven't submitted any feedback yet.</p>
          <Link to="/student/feedback/new" className="text-cyan-400 hover:text-cyan-300 font-medium">Submit your first feedback</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <Link key={fb.id} to={`/feedback/${fb.id}`}
              className="flex items-center justify-between bg-navy-900 rounded-xl border border-navy-700 p-5 hover:border-cyan-500/30 hover:bg-navy-800 transition-all">
              <div>
                <p className="font-medium text-white">{fb.subject_detail?.name}</p>
                <p className="text-sm text-gray-500">{fb.subject_detail?.code} &middot; {new Date(fb.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-white">{fb.rating_overall}/5</span>
                </div>
                {fb.sentiment && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    fb.sentiment.sentiment_label === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    fb.sentiment.sentiment_label === 'negative' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {fb.sentiment.sentiment_label}
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
