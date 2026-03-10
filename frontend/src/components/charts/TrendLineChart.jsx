import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
         ResponsiveContainer, ReferenceLine } from 'recharts';

export default function TrendLineChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-center py-8">No trend data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1c2744" />
        <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
        <YAxis domain={[-1, 1]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#151d35', border: '1px solid #1c2744', borderRadius: '8px', color: '#e5e7eb' }}
          itemStyle={{ color: '#22d3ee' }}
        />
        <ReferenceLine y={0} stroke="#374151" strokeDasharray="3 3" />
        <Line type="monotone" dataKey="polarity" stroke="#22d3ee"
              strokeWidth={2} dot={{ r: 3, fill: '#22d3ee', stroke: '#151d35' }}
              activeDot={{ r: 5, fill: '#22d3ee', stroke: '#fff' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
