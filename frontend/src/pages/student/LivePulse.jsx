import { useState, useEffect, useRef } from 'react';
import { joinSession, submitPulse, submitQuestion, getQuestions, upvoteQuestion } from '../../api/live';
import { Radio, LogIn, Send, ChevronUp, MessageCircle, Zap, Eye, EyeOff } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('reactions');

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingQ, setSubmittingQ] = useState(false);
  const questionsInterval = useRef(null);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Enter a session code');
      return;
    }
    try {
      const res = await joinSession({ session_code: code.trim().toUpperCase() });
      setSession(res.data.session);
      toast.success(`Joined ${res.data.session.display_name}!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid session code');
    }
  };

  // Poll questions when on questions tab
  useEffect(() => {
    if (!session?.id) return;

    const fetchQuestions = () => {
      getQuestions(session.id)
        .then(res => setQuestions(res.data))
        .catch(() => {});
    };

    fetchQuestions();
    questionsInterval.current = setInterval(fetchQuestions, 5000);

    return () => {
      if (questionsInterval.current) clearInterval(questionsInterval.current);
    };
  }, [session?.id]);

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

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim() || !session) return;

    setSubmittingQ(true);
    try {
      const res = await submitQuestion({
        session: session.id,
        text: questionText.trim(),
        is_anonymous: isAnonymous,
      });
      setQuestions(prev => [res.data, ...prev]);
      setQuestionText('');
      toast.success('Question submitted!');
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('Session has ended');
        setSession(null);
      } else {
        toast.error('Failed to submit question');
      }
    } finally {
      setSubmittingQ(false);
    }
  };

  const handleUpvote = async (questionId) => {
    try {
      const res = await upvoteQuestion(questionId);
      setQuestions(prev => prev.map(q =>
        q.id === questionId
          ? { ...q, upvote_count: res.data.upvote_count, has_upvoted: res.data.action === 'added' }
          : q
      ));
    } catch {
      toast.error('Failed to upvote');
    }
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

  // Active session
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
        <p className="text-lg text-cyan-400 font-medium">{session.display_name}</p>
        <p className="text-sm text-gray-400">
          {session.subject_code ? `${session.subject_code} · ` : session.session_type !== 'class' ? `${session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} · ` : ''}
          {session.faculty_name}
        </p>
      </div>

      {/* Tab toggle */}
      <div className="flex rounded-lg overflow-hidden border border-navy-600 max-w-lg mx-auto">
        <button
          onClick={() => setActiveTab('reactions')}
          className={`flex-1 py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'reactions'
              ? 'bg-cyan-500/20 text-cyan-400'
              : 'bg-navy-800 text-gray-400 hover:text-white'
          }`}
        >
          <Zap className="h-4 w-4" /> Reactions
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-1.5 border-l border-navy-600 ${
            activeTab === 'questions'
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-navy-800 text-gray-400 hover:text-white'
          }`}
        >
          <MessageCircle className="h-4 w-4" /> Questions {questions.length > 0 && `(${questions.length})`}
        </button>
      </div>

      {/* Reactions tab */}
      {activeTab === 'reactions' && (
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
      )}

      {/* Questions tab */}
      {activeTab === 'questions' && (
        <div className="max-w-lg mx-auto space-y-4">
          {/* Ask question form */}
          <form onSubmit={handleAskQuestion} className="bg-navy-900 rounded-xl border border-navy-700 p-4">
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Type your question..."
              rows={2}
              className="w-full bg-navy-800 border border-navy-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none text-sm"
            />
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                  isAnonymous
                    ? 'border-purple-500/40 bg-purple-500/10 text-purple-400'
                    : 'border-navy-600 bg-navy-800 text-gray-400 hover:text-white'
                }`}
              >
                {isAnonymous ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {isAnonymous ? 'Anonymous' : 'Show my name'}
              </button>
              <button
                type="submit"
                disabled={!questionText.trim() || submittingQ}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-purple-400 hover:to-indigo-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="h-3.5 w-3.5" /> Ask
              </button>
            </div>
          </form>

          {/* Questions list */}
          <div className="space-y-2">
            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No questions yet. Be the first to ask!
              </div>
            ) : (
              questions.map(q => (
                <div
                  key={q.id}
                  className={`bg-navy-900 rounded-xl border p-4 ${
                    q.is_answered ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-navy-700'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Upvote button */}
                    <button
                      onClick={() => handleUpvote(q.id)}
                      className={`flex flex-col items-center gap-0.5 pt-1 ${
                        q.has_upvoted ? 'text-purple-400' : 'text-gray-500 hover:text-purple-400'
                      } transition-colors`}
                    >
                      <ChevronUp className="h-5 w-5" />
                      <span className="text-xs font-bold">{q.upvote_count}</span>
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{q.text}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-gray-500">{q.student_name}</span>
                        <span className="text-xs text-gray-600">&middot;</span>
                        <span className="text-xs text-gray-600">{new Date(q.created_at).toLocaleTimeString()}</span>
                        {q.is_answered && (
                          <span className="text-xs text-emerald-400 font-medium">Answered</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
