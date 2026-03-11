import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeedbackList } from '../../api/feedback';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Star, ChevronRight, ChevronLeft, MessageCircle } from 'lucide-react';

export default function FeedbackHistory() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const fetchFeedbacks = (pageNum) => {
    setLoading(true);
    getFeedbackList({ page: pageNum })
      .then((res) => {
        const data = res.data;
        if (data.results) {
          setFeedbacks(data.results);
          setTotalCount(data.count || 0);
          setNextPage(data.next ? pageNum + 1 : null);
          setPrevPage(data.previous ? pageNum - 1 : null);
        } else {
          setFeedbacks(data);
          setTotalCount(data.length);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFeedbacks(page); }, [page]);

  if (loading && feedbacks.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">My Feedback History</h1>
        {totalCount > 0 && (
          <span className="text-sm text-gray-500">{totalCount} total</span>
        )}
      </div>
      {feedbacks.length === 0 ? (
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-12 text-center">
          <p className="text-gray-500 mb-4">You haven't submitted any feedback yet.</p>
          <Link to="/student/feedback/new" className="text-cyan-400 hover:text-cyan-300 font-medium">Submit your first feedback</Link>
        </div>
      ) : (
        <>
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
                  {fb.response && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      <MessageCircle className="h-3 w-3" /> Replied
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {(prevPage || nextPage) && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setPage(prevPage)}
                disabled={!prevPage}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-navy-600 text-sm text-gray-400 hover:text-white hover:border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-sm text-gray-500">Page {page}</span>
              <button
                onClick={() => setPage(nextPage)}
                disabled={!nextPage}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-navy-600 text-sm text-gray-400 hover:text-white hover:border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
