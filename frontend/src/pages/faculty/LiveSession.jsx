import { useState, useEffect, useRef } from 'react';
import { startLiveSession, endLiveSession, getActiveSession, getSessionDashboard, getSessionStudents, getQuestions, markQuestionAnswered } from '../../api/live';
import { getSubjects } from '../../api/courses';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Radio, StopCircle, Users, Zap, Copy, Check, X, AlertTriangle, MessageCircle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import toast from 'react-hot-toast';

const REACTION_META = {
  too_fast: { label: 'Too Fast', color: '#f87171', emoji: '\u23E9' },
  too_slow: { label: 'Too Slow', color: '#fbbf24', emoji: '\u23EA' },
  confused: { label: 'Confused', color: '#fb923c', emoji: '\uD83D\uDE15' },
  got_it: { label: 'Got It', color: '#34d399', emoji: '\u2705' },
  interesting: { label: 'Interesting', color: '#a78bfa', emoji: '\u2728' },
  boring: { label: 'Boring', color: '#94a3b8', emoji: '\uD83D\uDE34' },
};

const SESSION_TYPES = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'masterclass', label: 'Masterclass' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'other', label: 'Other' },
];

export default function LiveSession() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sessionMode, setSessionMode] = useState('class'); // 'class' or 'custom'
  const [customTitle, setCustomTitle] = useState('');
  const [customType, setCustomType] = useState('hackathon');
  const [session, setSession] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [studentsData, setStudentsData] = useState(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const intervalRef = useRef(null);
  const questionsIntervalRef = useRef(null);

  // Load subjects and check for active session
  useEffect(() => {
    Promise.all([getSubjects(), getActiveSession()])
      .then(([subRes, activeRes]) => {
        setSubjects(subRes.data.results || subRes.data);
        if (activeRes.data.active) {
          setSession(activeRes.data.session);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Poll dashboard data when session is active
  useEffect(() => {
    if (!session?.id || !session?.is_active) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const fetchDashboard = () => {
      getSessionDashboard(session.id)
        .then(res => setDashboard(res.data))
        .catch(() => {});
    };

    fetchDashboard();
    intervalRef.current = setInterval(fetchDashboard, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session?.id, session?.is_active]);

  // Poll questions when session is active
  useEffect(() => {
    if (!session?.id || !session?.is_active) {
      if (questionsIntervalRef.current) clearInterval(questionsIntervalRef.current);
      return;
    }

    const fetchQuestions = () => {
      getQuestions(session.id)
        .then(res => setQuestions(res.data))
        .catch(() => {});
    };

    fetchQuestions();
    questionsIntervalRef.current = setInterval(fetchQuestions, 5000);

    return () => {
      if (questionsIntervalRef.current) clearInterval(questionsIntervalRef.current);
    };
  }, [session?.id, session?.is_active]);

  const handleStart = async () => {
    if (sessionMode === 'class' && !selectedSubject) {
      toast.error('Select a subject first');
      return;
    }
    if (sessionMode === 'custom' && !customTitle.trim()) {
      toast.error('Enter a session title');
      return;
    }
    try {
      const payload = sessionMode === 'class'
        ? { subject: selectedSubject, session_type: 'class' }
        : { title: customTitle.trim(), session_type: customType };
      const res = await startLiveSession(payload);
      setSession(res.data);
      toast.success('Live session started!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start session');
    }
  };

  const handleEnd = async () => {
    if (!session) return;
    try {
      const res = await endLiveSession(session.id);
      setSession(res.data);
      if (intervalRef.current) clearInterval(intervalRef.current);
      toast.success('Session ended');
    } catch {
      toast.error('Failed to end session');
    }
  };

  const handleToggleAnswered = async (questionId) => {
    try {
      const res = await markQuestionAnswered(questionId);
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, is_answered: res.data.is_answered } : q
      ));
    } catch {
      toast.error('Failed to update question');
    }
  };

  const handleShowStudents = async () => {
    if (!session) return;
    setShowStudents(true);
    setStudentsLoading(true);
    try {
      const res = await getSessionStudents(session.id);
      setStudentsData(res.data);
    } catch {
      toast.error('Failed to load student list');
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.session_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingSpinner />;

  // No active session — show start form
  if (!session || !session.is_active) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Radio className="h-6 w-6 text-red-400" /> Live Feedback Mode
        </h1>

        <div className="bg-navy-900 rounded-xl border border-navy-700 p-8 max-w-lg mx-auto">
          <h2 className="text-lg font-semibold text-white mb-2">Start a Live Session</h2>
          <p className="text-sm text-gray-400 mb-6">Students will join using a session code and send real-time reactions.</p>

          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-navy-600 mb-5">
            <button
              onClick={() => setSessionMode('class')}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                sessionMode === 'class'
                  ? 'bg-cyan-500/20 text-cyan-400 border-r border-navy-600'
                  : 'bg-navy-800 text-gray-400 hover:text-white border-r border-navy-600'
              }`}
            >
              Class Session
            </button>
            <button
              onClick={() => setSessionMode('custom')}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                sessionMode === 'custom'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-navy-800 text-gray-400 hover:text-white'
              }`}
            >
              Custom Event
            </button>
          </div>

          {sessionMode === 'class' ? (
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-navy-800 border border-navy-600 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:border-cyan-500"
            >
              <option value="">Select a subject...</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          ) : (
            <div className="space-y-3 mb-4">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Session title (e.g., AI Workshop, Code Sprint)"
                className="w-full bg-navy-800 border border-navy-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="w-full bg-navy-800 border border-navy-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                {SESSION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleStart}
            className={`w-full py-3 text-white font-semibold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
              sessionMode === 'class'
                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 shadow-red-500/20'
                : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 shadow-purple-500/20'
            }`}
          >
            <Radio className="h-5 w-5" /> Go Live
          </button>
        </div>

        {/* Past sessions */}
        {session && !session.is_active && dashboard && (
          <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Last Session Summary</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-navy-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-cyan-400">{dashboard.total_pulses}</p>
                <p className="text-xs text-gray-400">Total Reactions</p>
              </div>
              <div className="bg-navy-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-emerald-400">{dashboard.student_count}</p>
                <p className="text-xs text-gray-400">Students</p>
              </div>
              <div className="bg-navy-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-amber-400">
                  {session.session_code}
                </p>
                <p className="text-xs text-gray-400">Session Code</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active session — show real-time dashboard
  const reactionChartData = Object.entries(REACTION_META).map(([key, meta]) => ({
    name: meta.label,
    count: dashboard?.reaction_counts?.[key] || 0,
    fill: meta.color,
  }));

  return (
    <div className="space-y-6">
      {/* Header with session info */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            LIVE — {session.display_name}
          </h1>
          <p className="text-gray-400 text-sm">
            {session.subject_code ? `${session.subject_code} · ` : session.session_type !== 'class' ? `${session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} · ` : ''}
            Started {new Date(session.started_at).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleCopyCode}
            className="flex items-center gap-2 px-4 py-2 bg-navy-800 border border-navy-600 rounded-lg text-white hover:border-cyan-500/30 transition-all">
            <span className="text-xl font-mono font-bold tracking-widest text-cyan-400">{session.session_code}</span>
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-gray-400" />}
          </button>
          <button onClick={handleEnd}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all">
            <StopCircle className="h-4 w-4" /> End Session
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-4 text-center">
          <Zap className="h-6 w-6 text-cyan-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{dashboard?.total_pulses || 0}</p>
          <p className="text-xs text-gray-400">Total Reactions</p>
        </div>
        <button
          onClick={handleShowStudents}
          className="bg-navy-900 rounded-xl border border-navy-700 p-4 text-center hover:border-emerald-500/40 hover:bg-navy-800 transition-all cursor-pointer"
        >
          <Users className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{dashboard?.student_count || 0}</p>
          <p className="text-xs text-gray-400">Active Students</p>
          <p className="text-[10px] text-emerald-400/60 mt-0.5">Click to view</p>
        </button>
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-4 text-center">
          <p className="text-3xl mb-1">{REACTION_META[_dominantReaction(dashboard?.reaction_counts)]?.emoji || '-'}</p>
          <p className="text-sm font-semibold text-white">{REACTION_META[_dominantReaction(dashboard?.reaction_counts)]?.label || 'N/A'}</p>
          <p className="text-xs text-gray-400">Dominant Mood</p>
        </div>
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-4 text-center">
          <p className="text-3xl mb-1">{_moodIndicator(dashboard?.reaction_counts)}</p>
          <p className="text-sm font-semibold text-white">Class Pulse</p>
          <p className="text-xs text-gray-400">Overall Health</p>
        </div>
      </div>

      {/* Reaction distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Reaction Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={reactionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2744" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#151d35', border: '1px solid #1c2744', borderRadius: '8px', color: '#e5e7eb' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {reactionChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Live reaction buttons display */}
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Live Reaction Counts</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(REACTION_META).map(([key, meta]) => {
              const count = dashboard?.reaction_counts?.[key] || 0;
              return (
                <div key={key}
                  className="flex items-center gap-3 p-4 bg-navy-800 rounded-lg border border-navy-700">
                  <span className="text-2xl">{meta.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{meta.label}</p>
                    <div className="w-full bg-navy-700 rounded-full h-2 mt-1">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${dashboard?.total_pulses ? (count / dashboard.total_pulses * 100) : 0}%`,
                          backgroundColor: meta.color,
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-lg font-bold" style={{ color: meta.color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      {dashboard?.timeline?.length > 0 && (
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Reaction Timeline</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboard.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2744" />
              <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#151d35', border: '1px solid #1c2744', borderRadius: '8px', color: '#e5e7eb' }}
              />
              <Legend wrapperStyle={{ color: '#9ca3af' }} />
              {Object.entries(REACTION_META).map(([key, meta]) => (
                <Area key={key} type="monotone" dataKey={key} name={meta.label}
                  stroke={meta.color} fill={meta.color} fillOpacity={0.15} stackId="1" />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Live Questions */}
      <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-purple-400" />
          Live Questions
          {questions.length > 0 && (
            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
              {questions.filter(q => !q.is_answered).length} unanswered
            </span>
          )}
        </h2>

        {questions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No questions from students yet.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {questions.map(q => (
              <div
                key={q.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  q.is_answered
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-navy-600 bg-navy-800'
                }`}
              >
                {/* Upvote count */}
                <div className="flex flex-col items-center pt-0.5 min-w-[2rem]">
                  <span className={`text-sm font-bold ${q.upvote_count > 0 ? 'text-purple-400' : 'text-gray-600'}`}>
                    {q.upvote_count}
                  </span>
                  <span className="text-[10px] text-gray-600">votes</span>
                </div>

                {/* Question content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{q.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{q.student_name}</span>
                    <span className="text-xs text-gray-600">&middot;</span>
                    <span className="text-xs text-gray-600">
                      {new Date(q.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Mark as answered button */}
                <button
                  onClick={() => handleToggleAnswered(q.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    q.is_answered
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-navy-700 text-gray-400 border border-navy-600 hover:text-white hover:border-purple-500/30'
                  }`}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {q.is_answered ? 'Answered' : 'Mark Done'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent pulses */}
      {dashboard?.recent_pulses?.length > 0 && (
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Reactions</h2>
          <div className="flex flex-wrap gap-2">
            {dashboard.recent_pulses.map((p) => {
              const meta = REACTION_META[p.reaction] || {};
              return (
                <span key={p.id}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border"
                  style={{ borderColor: meta.color + '40', backgroundColor: meta.color + '15', color: meta.color }}>
                  {meta.emoji} {meta.label} &middot; {new Date(p.created_at).toLocaleTimeString()}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Students Modal */}
      {showStudents && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowStudents(false)}>
          <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-navy-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" /> Session Students
              </h2>
              <button onClick={() => setShowStudents(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[65vh] p-5 space-y-5">
              {studentsLoading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : studentsData ? (
                <>
                  {/* Summary */}
                  {studentsData.is_class_session && (
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                        <p className="text-xl font-bold text-emerald-400">{studentsData.active_count}</p>
                        <p className="text-xs text-gray-400">Present</p>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <p className="text-xl font-bold text-red-400">{studentsData.missing_count}</p>
                        <p className="text-xs text-gray-400">Missing</p>
                      </div>
                      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                        <p className="text-xl font-bold text-cyan-400">{studentsData.roster_count}</p>
                        <p className="text-xs text-gray-400">Total Roster</p>
                      </div>
                    </div>
                  )}

                  {/* Outsiders warning */}
                  {studentsData.outsiders?.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                      <p className="text-sm font-medium text-amber-400 flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="h-4 w-4" /> Unknown Students (not in class roster)
                      </p>
                      {studentsData.outsiders.map(s => (
                        <div key={s.id} className="flex items-center justify-between py-1.5 text-sm">
                          <span className="text-amber-300">{s.full_name}</span>
                          <span className="text-amber-400/60 text-xs">{s.enrollment_no || s.username}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Active students */}
                  <div>
                    <h3 className="text-sm font-medium text-emerald-400 mb-2">
                      Active ({studentsData.active_count})
                    </h3>
                    {studentsData.active.length > 0 ? (
                      <div className="space-y-1">
                        {studentsData.active.map(s => (
                          <div key={s.id} className="flex items-center justify-between py-2 px-3 bg-navy-800 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                              <span className="text-sm text-white">{s.full_name}</span>
                            </div>
                            <span className="text-xs text-gray-500">{s.enrollment_no || s.username}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No active students yet</p>
                    )}
                  </div>

                  {/* Missing students — only for class sessions */}
                  {studentsData.is_class_session && (
                    <div>
                      <h3 className="text-sm font-medium text-red-400 mb-2">
                        Missing ({studentsData.missing_count})
                      </h3>
                      {studentsData.missing.length > 0 ? (
                        <div className="space-y-1">
                          {studentsData.missing.map(s => (
                            <div key={s.id} className="flex items-center justify-between py-2 px-3 bg-navy-800/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-400/50"></span>
                                <span className="text-sm text-gray-400">{s.full_name}</span>
                              </div>
                              <span className="text-xs text-gray-600">{s.enrollment_no || s.username}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">All students are present!</p>
                      )}
                    </div>
                  )}

                  {!studentsData.is_class_session && (
                    <p className="text-sm text-gray-500 text-center">
                      This is a custom session — no class roster available for attendance tracking.
                    </p>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function _dominantReaction(counts) {
  if (!counts) return null;
  let max = 0, dominant = null;
  for (const [key, val] of Object.entries(counts)) {
    if (val > max) { max = val; dominant = key; }
  }
  return dominant;
}

function _moodIndicator(counts) {
  if (!counts) return '\uD83D\uDFE2';
  const positive = (counts.got_it || 0) + (counts.interesting || 0);
  const negative = (counts.confused || 0) + (counts.boring || 0) + (counts.too_fast || 0) + (counts.too_slow || 0);
  const total = positive + negative;
  if (total === 0) return '\uD83D\uDFE2';
  const ratio = positive / total;
  if (ratio >= 0.7) return '\uD83D\uDFE2';
  if (ratio >= 0.4) return '\uD83D\uDFE1';
  return '\uD83D\uDD34';
}
