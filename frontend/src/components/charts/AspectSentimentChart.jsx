import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const SENTIMENT_COLORS = { positive: '#34d399', neutral: '#fbbf24', negative: '#f87171' };

export default function AspectSentimentChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-center py-8">No aspect data yet</p>;
  }

  const chartData = data.map(a => ({
    name: a.label,
    positive: a.positive,
    neutral: a.neutral,
    negative: a.negative,
    polarity: a.avg_polarity,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#1c2744" />
          <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis dataKey="name" type="category" width={130} tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#151d35', border: '1px solid #1c2744', borderRadius: '8px', color: '#e5e7eb' }}
            itemStyle={{ color: '#e5e7eb' }}
          />
          <Legend wrapperStyle={{ color: '#9ca3af' }} />
          <Bar dataKey="positive" stackId="a" fill={SENTIMENT_COLORS.positive} name="Positive" />
          <Bar dataKey="neutral" stackId="a" fill={SENTIMENT_COLORS.neutral} name="Neutral" />
          <Bar dataKey="negative" stackId="a" fill={SENTIMENT_COLORS.negative} name="Negative" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Aspect polarity indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {data.map(a => (
          <div key={a.aspect} className="bg-navy-800 rounded-lg p-3 border border-navy-700">
            <p className="text-xs text-gray-400">{a.label}</p>
            <p className={`text-lg font-bold ${
              a.avg_polarity > 0.1 ? 'text-emerald-400' :
              a.avg_polarity < -0.1 ? 'text-red-400' : 'text-amber-400'
            }`}>
              {a.avg_polarity > 0 ? '+' : ''}{a.avg_polarity?.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">{a.total} mention{a.total !== 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
