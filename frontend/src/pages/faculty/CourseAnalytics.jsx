import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSubjectAnalytics } from '../../api/dashboard';
import SentimentPieChart from '../../components/charts/SentimentPieChart';
import RatingBarChart from '../../components/charts/RatingBarChart';
import TrendLineChart from '../../components/charts/TrendLineChart';
import KeywordCloud from '../../components/charts/KeywordCloud';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function CourseAnalytics() {
  const { subjectId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubjectAnalytics(subjectId)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [subjectId]);

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
      <div>
        <h1 className="text-2xl font-bold text-white">{data.subject.name}</h1>
        <p className="text-gray-400">{data.subject.code} &middot; {data.ratings.total_count} feedback submissions</p>
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
    </div>
  );
}
