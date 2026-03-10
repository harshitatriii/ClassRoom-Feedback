import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFeedbackDetail } from '../../api/feedback';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Star } from 'lucide-react';

function RatingRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className={`h-4 w-4 ${s <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
        ))}
        <span className="text-sm font-medium ml-2">{value}/5</span>
      </div>
    </div>
  );
}

export default function FeedbackDetail() {
  const { id } = useParams();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeedbackDetail(id)
      .then((res) => setFeedback(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!feedback) return <p className="text-gray-400">Feedback not found.</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">{feedback.subject_detail?.name}</h1>
          <p className="text-sm text-gray-500">
            {feedback.subject_detail?.code} &middot; {new Date(feedback.created_at).toLocaleDateString()}
            {feedback.is_anonymous && ' &middot; Anonymous'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            By: {feedback.student_info?.full_name || 'Anonymous Student'}
          </p>
        </div>

        <div className="space-y-3">
          <RatingRow label="Teaching Quality" value={feedback.rating_teaching} />
          <RatingRow label="Content Quality" value={feedback.rating_content} />
          <RatingRow label="Engagement" value={feedback.rating_engagement} />
          <RatingRow label="Overall" value={feedback.rating_overall} />
        </div>

        {feedback.text_feedback && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-sm font-medium text-gray-700 mb-2">Written Feedback</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{feedback.text_feedback}</p>
          </div>
        )}
      </div>

      {feedback.sentiment && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Analysis</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <p className="text-2xl font-bold">{feedback.sentiment.polarity?.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Polarity</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <p className="text-2xl font-bold">{feedback.sentiment.subjectivity?.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Subjectivity</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                feedback.sentiment.sentiment_label === 'positive' ? 'bg-green-100 text-green-700' :
                feedback.sentiment.sentiment_label === 'negative' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {feedback.sentiment.sentiment_label}
              </span>
              <p className="text-xs text-gray-500 mt-2">Sentiment</p>
            </div>
          </div>
          {feedback.sentiment.keywords?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {feedback.sentiment.keywords.map((kw) => (
                  <span key={kw} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
