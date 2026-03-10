import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubjects } from '../../api/courses';
import { submitFeedback } from '../../api/feedback';
import StarRating from '../../components/ui/StarRating';
import toast from 'react-hot-toast';

export default function FeedbackForm() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    subject: '', rating_teaching: 0, rating_content: 0,
    rating_engagement: 0, rating_overall: 0,
    text_feedback: '', is_anonymous: true,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getSubjects({ is_active: 'true' }).then((res) => {
      setSubjects(res.data.results || res.data);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject) return toast.error('Please select a subject');
    if ([form.rating_teaching, form.rating_content, form.rating_engagement, form.rating_overall].some(r => r === 0)) {
      return toast.error('Please provide all ratings');
    }
    setLoading(true);
    try {
      await submitFeedback({ ...form, subject: parseInt(form.subject) });
      toast.success('Feedback submitted successfully!');
      navigate('/student/feedback');
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0]
        || err.response?.data?.detail
        || Object.values(err.response?.data || {}).flat().join(', ')
        || 'Failed to submit feedback';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Submit Feedback</h1>
      <form onSubmit={handleSubmit} className="bg-navy-900 rounded-xl border border-navy-700 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject *</label>
          <select
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full px-4 py-2.5 bg-navy-800 border border-navy-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 outline-none"
            required
          >
            <option value="">Select a subject...</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <StarRating label="Teaching Quality *" value={form.rating_teaching}
            onChange={(v) => setForm({ ...form, rating_teaching: v })} />
          <StarRating label="Content Quality *" value={form.rating_content}
            onChange={(v) => setForm({ ...form, rating_content: v })} />
          <StarRating label="Engagement *" value={form.rating_engagement}
            onChange={(v) => setForm({ ...form, rating_engagement: v })} />
          <StarRating label="Overall *" value={form.rating_overall}
            onChange={(v) => setForm({ ...form, rating_overall: v })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Written Feedback</label>
          <textarea
            value={form.text_feedback}
            onChange={(e) => setForm({ ...form, text_feedback: e.target.value })}
            rows={4}
            placeholder="Share your thoughts about this subject..."
            className="w-full px-4 py-2.5 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="anonymous"
            checked={form.is_anonymous}
            onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })}
            className="rounded border-navy-600 bg-navy-800 text-cyan-500 focus:ring-cyan-500"
          />
          <label htmlFor="anonymous" className="text-sm text-gray-400">Submit anonymously</label>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2.5 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50 font-semibold shadow-lg shadow-cyan-500/20">
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
