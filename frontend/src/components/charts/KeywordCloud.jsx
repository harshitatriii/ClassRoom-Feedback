export default function KeywordCloud({ keywords }) {
  if (!keywords || keywords.length === 0) {
    return <p className="text-gray-400 text-center py-8">No keywords yet</p>;
  }

  const maxCount = Math.max(...keywords.map(k => k.count));

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map(({ word, count }) => {
        const size = 0.75 + (count / maxCount) * 1.25;
        return (
          <span key={word}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                style={{ fontSize: `${size}rem` }}>
            {word}
          </span>
        );
      })}
    </div>
  );
}
