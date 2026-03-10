import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RatingBarChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-center py-8">No rating data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1c2744" />
        <XAxis dataKey="category" tick={{ fill: '#9ca3af', fontSize: 12 }} />
        <YAxis domain={[0, 5]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#151d35', border: '1px solid #1c2744', borderRadius: '8px', color: '#e5e7eb' }}
          itemStyle={{ color: '#22d3ee' }}
        />
        <Bar dataKey="average" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
