import { useEffect, useState } from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import { supabase, type SnakeScore } from '../lib/supabase';

export function Leaderboard({ refreshKey }: { refreshKey: number }) {
  const [scores, setScores] = useState<SnakeScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('snake_scores')
        .select('id, player_name, score, level, created_at')
        .order('score', { ascending: false })
        .limit(10);
      if (!active) return;
      if (error) {
        setError('Could not load leaderboard.');
        setScores([]);
      } else {
        setError(null);
        setScores((data as SnakeScore[]) ?? []);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <div className="w-full rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-700/60 p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-semibold text-slate-100">Leaderboard</h2>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-sm text-rose-400 py-6 text-center">{error}</p>
      ) : scores.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">
          No scores yet. Be the first!
        </p>
      ) : (
        <ol className="space-y-2">
          {scores.map((s, i) => (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-3 py-2"
            >
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                  i === 0
                    ? 'bg-amber-400 text-slate-900'
                    : i === 1
                    ? 'bg-slate-300 text-slate-900'
                    : i === 2
                    ? 'bg-orange-700 text-slate-50'
                    : 'bg-slate-700 text-slate-200'
                }`}
              >
                {i + 1}
              </span>
              <span className="flex-1 truncate text-slate-100 font-medium">
                {s.player_name}
              </span>
              <span className="text-xs text-slate-400">Lvl {s.level}</span>
              <span className="text-emerald-400 font-semibold tabular-nums">
                {s.score}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
