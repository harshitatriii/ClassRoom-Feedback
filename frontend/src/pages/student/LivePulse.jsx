import { useState } from 'react';
import { joinSession, submitPulse } from '../../api/live';
import { Radio, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const REACTIONS = [
  { key: 'got_it', label: 'Got It', emoji: '\u2705', color: '#34d399', description: 'I understand' },
  { key: 'interesting', label: 'Interesting', emoji: '\u2728', color: '#a78bfa', description: 'This is cool!' },
  { key: 'confused', label: 'Confused', emoji: '\uD83D\uDE15', color: '#fb923c', description: "I'm lost" },
  { key: 'too_fast', label: 'Too Fast', emoji: '\u23E9', color: '#f87171', description: 'Slow down' },
  { key: 'too_slow', label: 'Too Slow', emoji: '\u23EA', color: '#fbbf24', description: 'Speed up' },
  { key: 'boring', label: 'Boring', emoji: '\uD83D\uDE34', color: '#94a3b8', description: 'Not engaging' },
];

export default function LivePulse() {
  const [code, setCode] = useState('');
  const [session, setSession] = useState(null);
  const [lastReaction, setLastReaction] = useState(null);
  const [cooldown, setCooldown] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Enter a session code');
      return;
    }
    try {
      const res = await joinSession({ session_code: code.trim().toUpperCase() });
      setSession(res.data.session);
      toast.success(`Joined ${res.data.session.subject_name}!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid session code');
    }
  };

  const handleReaction = async (reaction) => {
    if (cooldown || !session) return;

    setCooldown(true);
    setLastReaction(reaction);

    try {
      await submitPulse({ session: session.id, reaction });
      setPulseCount(prev => prev + 1);
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error('Too fast! Wait a moment.');
      } else if (err.response?.status === 404) {
        toast.error('Session has ended');
        setSession(null);
      } else {
        toast.error('Failed to send reaction');
      }
    }

    setTimeout(() => setCooldown(false), 5000);
  };

  // Join screen
  if (!session) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Radio className="h-6 w-6 text-red-400" /> Live Feedback
        </h1>

        <div className="bg-navy-900 rounded-xl border border-navy-700 p-8 max-w-md mx-auto text-center">
          <div className="p-4 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <LogIn className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Join a Live Session</h2>
          <p className="text-sm text-gray-400 mb-6">Enter the session code shared by your faculty to send real-time reactions during class.</p>

          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full bg-navy-800 border border-navy-600 rounded-lg px-4 py-4 text-center text-2xl font-mono font-bold tracking-[0.3em] text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 uppercase"
            />
            <button type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20">
              Join Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active session — show reaction buttons
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <h1 className="text-2xl font-bold text-white">LIVE</h1>
        </div>
        <p className="text-lg text-cyan-400 font-medium">{session.subject_name}</p>
        <p className="text-sm text-gray-400">
          {session.subject_code} &middot; {session.faculty_name}
        </p>
      </div>

      <div className="bg-navy-900 rounded-xl border border-navy-700 p-6 max-w-lg mx-auto">
        <p className="text-center text-sm text-gray-400 mb-4">Tap a reaction to send feedback in real-time</p>

        <div className="grid grid-cols-2 gap-3">
          {REACTIONS.map(r => {
            const isLast = lastReaction === r.key;
            return (
              <button
                key={r.key}
                onClick={() => handleReaction(r.key)}
                disabled={cooldown}
                className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-300 ${
                  cooldown
                    ? 'opacity-40 cursor-not-allowed border-navy-700 bg-navy-800'
                    : isLast
                    ? 'border-opacity-60 scale-95 bg-opacity-20'
                    : 'border-navy-700 bg-navy-800 hover:scale-105 hover:border-opacity-50 active:scale-95'
                }`}
                style={isLast ? { borderColor: r.color, backgroundColor: r.color + '15' } : {}}
              >
                <span className="text-4xl">{r.emoji}</span>
                <span className="text-sm font-semibold text-white">{r.label}</span>
                <span className="text-xs text-gray-500">{r.description}</span>
              </button>
            );
          })}
        </div>

        {/* Cooldown indicator */}
        {cooldown && (
          <div className="mt-4 text-center">
            <div className="h-1 bg-navy-700 rounded-full overflow-hidden max-w-xs mx-auto">
              <div className="h-full bg-cyan-400 rounded-full animate-cooldown"></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Next reaction in a few seconds...</p>
          </div>
        )}

        <div className="mt-4 text-center text-sm text-gray-500">
          You've sent <span className="text-cyan-400 font-medium">{pulseCount}</span> reaction{pulseCount !== 1 ? 's' : ''} this session
        </div>
      </div>

      <style>{`
        @keyframes cooldown {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-cooldown {
          animation: cooldown 5s linear forwards;
        }
      `}</style>
    </div>
  );
}
