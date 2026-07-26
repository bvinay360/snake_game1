import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ScoreSubmitModal({
  score,
  level,
  onClose,
  onSubmitted,
}: {
  score: number;
  level: number;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a name.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from('snake_scores').insert({
      player_name: trimmed.slice(0, 20),
      score,
      level,
    });
    setSubmitting(false);
    if (error) {
      setError('Failed to save score. Try again.');
      return;
    }
    setDone(true);
    onSubmitted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
        {done ? (
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-emerald-400 mb-2">Saved!</p>
            <p className="text-slate-300 text-sm mb-5">
              Your score is on the leaderboard.
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold py-2.5 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-slate-100 mb-1">
              Game Over
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Score: <span className="text-emerald-400 font-semibold">{score}</span>{' '}
              · Level {level}
            </p>
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">
              Your name
            </label>
            <input
              autoFocus
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
              placeholder="Enter name"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
            />
            {error && <p className="text-sm text-rose-400 mb-3">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium py-2.5 transition disabled:opacity-50"
              >
                Skip
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold py-2.5 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Saving' : 'Save score'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
