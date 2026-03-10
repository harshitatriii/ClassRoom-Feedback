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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Feedback History</h1>
      {feedbacks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 mb-4">You haven't submitted any feedback yet.</p>
          <Link to="/student/feedback/new" className="text-blue-600 hover:underline">Submit your first feedback</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <Link key={fb.id} to={`/feedback/${fb.id}`}
              className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all">
              <div>
                <p className="font-medium text-gray-900">{fb.subject_detail?.name}</p>
                <p className="text-sm text-gray-500">{fb.subject_detail?.code} &middot; {new Date(fb.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-gray-900">{fb.rating_overall}/5</span>
                </div>
                {fb.sentiment && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    fb.sentiment.sentiment_label === 'positive' ? 'bg-green-100 text-green-700' :
                    fb.sentiment.sentiment_label === 'negative' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {fb.sentiment.sentiment_label}
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
