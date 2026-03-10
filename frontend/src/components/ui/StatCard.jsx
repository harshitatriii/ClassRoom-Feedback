export default function StatCard({ icon: Icon, label, value, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    yellow: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  return (
    <div className="bg-navy-900 rounded-xl border border-navy-700 p-6 hover:border-navy-600 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg border ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-white">
            {value !== null && value !== undefined ? value : '--'}
          </p>
        </div>
      </div>
    </div>
  );
}
