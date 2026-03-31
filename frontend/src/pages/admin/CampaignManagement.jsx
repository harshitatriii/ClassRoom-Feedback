import { useState, useEffect } from 'react';
import { getCampaigns, createCampaign, deleteCampaign, getCampaignCompletion } from '../../api/feedback';
import { getPrograms } from '../../api/courses';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Calendar, Plus, Trash2, BarChart3, X, Users, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [completionLoading, setCompletionLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    program: '',
    semester: '',
    is_mandatory: true,
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    Promise.all([getCampaigns(), getPrograms()])
      .then(([campRes, progRes]) => {
        setCampaigns(campRes.data.results || campRes.data);
        setPrograms(progRes.data.results || progRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        program: form.program || null,
        semester: form.semester || null,
      };
      const res = await createCampaign(payload);
      setCampaigns(prev => [res.data, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', program: '', semester: '', is_mandatory: true, start_date: '', end_date: '' });
      toast.success('Campaign created!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create campaign');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await deleteCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      toast.success('Campaign deleted');
    } catch {
      toast.error('Failed to delete campaign');
    }
  };

  const handleViewCompletion = async (id) => {
    setCompletionLoading(true);
    setCompletionData(null);
    try {
      const res = await getCampaignCompletion(id);
      setCompletionData(res.data);
    } catch {
      toast.error('Failed to load completion data');
    } finally {
      setCompletionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="h-6 w-6 text-purple-400" /> Feedback Campaigns
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-lg hover:from-purple-400 hover:to-indigo-400 transition-all shadow-lg shadow-purple-500/20"
        >
          <Plus className="h-4 w-4" /> New Campaign
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-navy-900 rounded-xl border border-navy-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-2">Create Campaign</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., End-of-Semester Feedback Spring 2026"
                required
                className="w-full bg-navy-800 border border-navy-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description..."
                rows={2}
                className="w-full bg-navy-800 border border-navy-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Program (optional)</label>
              <select
                value={form.program}
                onChange={e => setForm({ ...form, program: e.target.value })}
                className="w-full bg-navy-800 border border-navy-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">All Programs</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Semester (optional)</label>
              <input
                type="number"
                min="1"
                max="12"
                value={form.semester}
                onChange={e => setForm({ ...form, semester: e.target.value })}
                placeholder="All semesters"
                className="w-full bg-navy-800 border border-navy-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
                required
                className="w-full bg-navy-800 border border-navy-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">End Date</label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })}
                required
                className="w-full bg-navy-800 border border-navy-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_mandatory}
                  onChange={e => setForm({ ...form, is_mandatory: e.target.checked })}
                  className="w-4 h-4 rounded border-navy-600 text-purple-500 focus:ring-purple-500 bg-navy-800"
                />
                <span className="text-sm text-white">Mandatory for students</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-lg hover:from-purple-400 hover:to-indigo-400 transition-all">
              Create Campaign
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-6 py-2.5 bg-navy-800 border border-navy-600 text-gray-400 rounded-lg hover:text-white transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Campaigns list */}
      {campaigns.length === 0 ? (
        <div className="bg-navy-900 rounded-xl border border-navy-700 p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No campaigns yet. Create one to start collecting semester feedback.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => (
            <div key={c.id} className={`bg-navy-900 rounded-xl border p-5 ${
              c.is_open ? 'border-emerald-500/30' : 'border-navy-700'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{c.title}</h3>
                    {c.is_open && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Open
                      </span>
                    )}
                    {c.is_mandatory && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        Mandatory
                      </span>
                    )}
                    {!c.is_active && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
                        Inactive
                      </span>
                    )}
                  </div>
                  {c.description && <p className="text-sm text-gray-400 mb-2">{c.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(c.start_date).toLocaleDateString()} - {new Date(c.end_date).toLocaleDateString()}
                    </span>
                    <span>{c.program_name}</span>
                    {c.semester && <span>Semester {c.semester}</span>}
                    {c.created_by_name && <span>by {c.created_by_name}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewCompletion(c.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-navy-800 border border-navy-600 rounded-lg text-xs text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                  >
                    <BarChart3 className="h-3.5 w-3.5" /> Stats
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completion Stats Modal */}
      {(completionData || completionLoading) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { setCompletionData(null); setCompletionLoading(false); }}>
          <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Campaign Completion</h2>
              <button onClick={() => { setCompletionData(null); setCompletionLoading(false); }}
                className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            {completionLoading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : completionData ? (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-purple-400">{completionData.campaign.title}</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-navy-800 rounded-lg p-3 text-center">
                    <Users className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{completionData.total_students}</p>
                    <p className="text-xs text-gray-500">Target Students</p>
                  </div>
                  <div className="bg-navy-800 rounded-lg p-3 text-center">
                    <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{completionData.completed_students}</p>
                    <p className="text-xs text-gray-500">Fully Completed</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Completion Rate</span>
                    <span className="text-white font-medium">{completionData.completion_rate}%</span>
                  </div>
                  <div className="w-full bg-navy-700 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${completionData.completion_rate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-navy-800 rounded-lg p-2">
                    <p className="text-white font-bold">{completionData.total_subjects}</p>
                    <p className="text-gray-500">Subjects</p>
                  </div>
                  <div className="bg-navy-800 rounded-lg p-2">
                    <p className="text-white font-bold">{completionData.actual_submissions}</p>
                    <p className="text-gray-500">Submissions</p>
                  </div>
                  <div className="bg-navy-800 rounded-lg p-2">
                    <p className="text-white font-bold">{completionData.submission_rate}%</p>
                    <p className="text-gray-500">Sub. Rate</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
