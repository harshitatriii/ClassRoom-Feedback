import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = { Positive: '#22c55e', Neutral: '#eab308', Negative: '#ef4444' };

export default function SentimentPieChart({ data }) {
  if (!data || data.every(d => d.value === 0)) {
    return <p className="text-gray-400 text-center py-8">No sentiment data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
             outerRadius={100} label>
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
