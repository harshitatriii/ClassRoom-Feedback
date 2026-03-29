import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const EMOTION_LABELS = {
  appreciation: 'Appreciation',
  frustration: 'Frustration',
  confusion: 'Confusion',
  boredom: 'Boredom',
  enthusiasm: 'Enthusiasm',
  satisfaction: 'Satisfaction',
};

const EMOTION_ICONS = {
  appreciation: { emoji: '\u2764\uFE0F', color: '#34d399' },
  frustration: { emoji: '\uD83D\uDE24', color: '#f87171' },
  confusion: { emoji: '\uD83D\uDE15', color: '#fbbf24' },
  boredom: { emoji: '\uD83D\uDE34', color: '#94a3b8' },
  enthusiasm: { emoji: '\uD83D\uDE80', color: '#a78bfa' },
  satisfaction: { emoji: '\uD83D\uDE0A', color: '#22d3ee' },
};

export default function EmotionChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 text-center py-8">No emotion data yet</p>;
  }

  const chartData = Object.entries(data).map(([emotion, score]) => ({
    emotion: EMOTION_LABELS[emotion] || emotion,
    score: Math.round(score * 100),
    key: emotion,
  }));

  // Find dominant emotion
  const dominant = chartData.reduce((max, item) => item.score > max.score ? item : max, chartData[0]);

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={chartData} outerRadius="75%">
          <PolarGrid stroke="#1c2744" />
          <PolarAngleAxis
            dataKey="emotion"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#151d35',
              border: '1px solid #1c2744',
              borderRadius: '8px',
              color: '#e5e7eb',
            }}
            formatter={(value) => [`${value}%`, 'Intensity']}
          />
          <Radar
            dataKey="score"
            stroke="#22d3ee"
            fill="#22d3ee"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Emotion breakdown tiles */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
        {chartData.map(item => {
          const info = EMOTION_ICONS[item.key] || { emoji: '', color: '#6b7280' };
          const isDominant = item.key === dominant.key && dominant.score > 0;
          return (
            <div key={item.key}
              className={`rounded-lg p-2 text-center border ${
                isDominant ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-navy-700 bg-navy-800'
              }`}>
              <span className="text-lg">{info.emoji}</span>
              <p className="text-xs text-gray-400 mt-1">{EMOTION_LABELS[item.key]}</p>
              <p className="text-sm font-bold" style={{ color: info.color }}>{item.score}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
