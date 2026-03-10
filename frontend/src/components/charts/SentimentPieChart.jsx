import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = { Positive: '#34d399', Neutral: '#fbbf24', Negative: '#f87171' };

export default function SentimentPieChart({ data }) {
  if (!data || data.every(d => d.value === 0)) {
    return <p className="text-gray-500 text-center py-8">No sentiment data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
             outerRadius={100} label={{ fill: '#9ca3af' }} stroke="#151d35">
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#151d35', border: '1px solid #1c2744', borderRadius: '8px', color: '#e5e7eb' }}
          itemStyle={{ color: '#e5e7eb' }}
        />
        <Legend wrapperStyle={{ color: '#9ca3af' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
