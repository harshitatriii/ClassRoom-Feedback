export default function KeywordCloud({ keywords }) {
  if (!keywords || keywords.length === 0) {
    return <p className="text-gray-500 text-center py-8">No keywords yet</p>;
  }

  const maxCount = Math.max(...keywords.map(k => k.count));
  const colors = ['text-cyan-400', 'text-blue-400', 'text-indigo-400', 'text-purple-400', 'text-emerald-400'];

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map(({ word, count }, i) => {
        const size = 0.75 + (count / maxCount) * 1.25;
        const colorClass = colors[i % colors.length];
        const bgColors = ['bg-cyan-500/15 border-cyan-500/30', 'bg-blue-500/15 border-blue-500/30', 'bg-indigo-500/15 border-indigo-500/30', 'bg-purple-500/15 border-purple-500/30', 'bg-emerald-500/15 border-emerald-500/30'];
        return (
          <span key={word}
                className={`${bgColors[i % bgColors.length]} ${colorClass} px-3 py-1 rounded-full border`}
                style={{ fontSize: `${size}rem` }}>
            {word}
          </span>
        );
      })}
    </div>
  );
}
