import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
         ResponsiveContainer, ReferenceLine } from 'recharts';

export default function TrendLineChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-400 text-center py-8">No trend data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[-1, 1]} />
        <Tooltip />
        <ReferenceLine y={0} stroke="#999" strokeDasharray="3 3" />
        <Line type="monotone" dataKey="polarity" stroke="#3b82f6"
              strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
