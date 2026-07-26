import { useCallbackRef } from '../hooks/useCallbackRef';
import { GRID_SIZE, type Point, type Direction, useSnakeGame } from '../hooks/useSnakeGame';
import { ScoreSubmitModal } from './ScoreSubmitModal';
import { Leaderboard } from './Leaderboard';
import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const KEY_TO_DIR: Record<string, Direction> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP',
  s: 'DOWN',
  a: 'LEFT',
  d: 'RIGHT',
};

export function SnakeGame() {
  const {
    snake,
    food,
    status,
    score,
    level,
    setQueuedDirection,
    start,
    togglePause,
  } = useSnakeGame();

  const [showSubmit, setShowSubmit] = useState(false);
  const [leaderboardKey, setLeaderboardKey] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const setDirRef = useCallbackRef(setQueuedDirection);
  const togglePauseRef = useCallbackRef(togglePause);
  const startRef = useCallbackRef(start);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_TO_DIR[e.key];
      if (dir) {
        e.preventDefault();
        setDirRef.current(dir);
        return;
      }
      if (e.key === ' ') {
        e.preventDefault();
        if (statusRef.current === 'idle' || statusRef.current === 'over') {
          startRef.current();
        } else {
          togglePauseRef.current();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setDirRef, togglePauseRef, startRef]);

  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    if (status === 'over') {
      setBestScore((b) => Math.max(b, score));
      setShowSubmit(true);
    }
  }, [status, score]);

  const handleStart = () => {
    setShowSubmit(false);
    start();
  };

  const handleSwipe = (dir: Direction) => setDirRef.current(dir);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-slate-100 flex flex-col items-center px-4 py-8">
      <header className="mb-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
          Snake
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Arrow keys / WASD to move · Space to start or pause
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full max-w-5xl">
        <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
          <div className="grid grid-cols-3 gap-3 w-full">
            <Stat label="Score" value={score} accent="text-emerald-400" />
            <Stat label="Level" value={level} accent="text-teal-300" />
            <Stat label="Best" value={bestScore} accent="text-amber-400" />
          </div>

          <Board
            snake={snake}
            food={food}
            status={status}
            onStart={handleStart}
            onResume={togglePause}
          />

          <div className="flex gap-3 w-full">
            {status === 'running' ? (
              <button
                onClick={togglePause}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-3 font-semibold transition"
              >
                <Pause className="w-4 h-4" /> Pause
              </button>
            ) : status === 'paused' ? (
              <button
                onClick={togglePause}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-4 py-3 font-semibold transition"
              >
                <Play className="w-4 h-4" /> Resume
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-4 py-3 font-semibold transition"
              >
                <Play className="w-4 h-4" />
                {status === 'over' ? 'Play again' : 'Start game'}
              </button>
            )}
            <button
              onClick={handleStart}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-3 font-semibold transition"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>

          <TouchControls onDir={handleSwipe} />
        </div>

        <div className="w-full lg:w-80">
          <Leaderboard refreshKey={leaderboardKey} />
        </div>
      </div>

      {showSubmit && (
        <ScoreSubmitModal
          score={score}
          level={level}
          onClose={() => setShowSubmit(false)}
          onSubmitted={() => setLeaderboardKey((k) => k + 1)}
        />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-700/60 px-3 py-2.5 text-center">
      <div className="text-[10px] uppercase tracking-widest text-slate-400">
        {label}
      </div>
      <div className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</div>
    </div>
  );
}

function Board({
  snake,
  food,
  status,
  onStart,
  onResume,
}: {
  snake: Point[];
  food: Point;
  status: string;
  onStart: () => void;
  onResume: () => void;
}) {
  return (
    <div
      className="relative w-full aspect-square rounded-2xl bg-slate-900/80 border border-slate-700/60 shadow-2xl overflow-hidden"
      style={{
        backgroundImage:
          'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
        backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`,
      }}
    >
      {snake.map((s, i) => (
        <Cell
          key={i}
          point={s}
          className={
            i === 0
              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
              : 'bg-emerald-600/90'
          }
        />
      ))}
      <Cell point={food} className="bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] rounded-full" />

      {status !== 'running' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          {status === 'over' ? (
            <>
              <p className="text-3xl font-extrabold text-rose-400 mb-1">Game Over</p>
              <button
                onClick={onStart}
                className="mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-6 py-2.5 transition"
              >
                Play again
              </button>
            </>
          ) : status === 'paused' ? (
            <>
              <p className="text-3xl font-extrabold text-slate-100 mb-1">Paused</p>
              <button
                onClick={onResume}
                className="mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-6 py-2.5 transition"
              >
                Resume
              </button>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-slate-100 mb-1">Ready?</p>
              <button
                onClick={onStart}
                className="mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-6 py-2.5 transition"
              >
                Start game
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Cell({ point, className }: { point: Point; className?: string }) {
  return (
    <div
      className={`absolute ${className ?? ''}`}
      style={{
        width: `${100 / GRID_SIZE}%`,
        height: `${100 / GRID_SIZE}%`,
        left: `${(point.x / GRID_SIZE) * 100}%`,
        top: `${(point.y / GRID_SIZE) * 100}%`,
        transition: 'left 60ms linear, top 60ms linear',
      }}
    />
  );
}

function TouchControls({ onDir }: { onDir: (d: Direction) => void }) {
  const btn =
    'flex items-center justify-center rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-700 active:bg-emerald-600 text-slate-100 transition';
  return (
    <div className="lg:hidden grid grid-cols-3 gap-2 w-44 mx-auto mt-1">
      <div />
      <button className={`${btn} h-12`} onClick={() => onDir('UP')}>
        <ArrowUp className="w-5 h-5" />
      </button>
      <div />
      <button className={`${btn} h-12`} onClick={() => onDir('LEFT')}>
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button className={`${btn} h-12`} onClick={() => onDir('DOWN')}>
        <ArrowDown className="w-5 h-5" />
      </button>
      <button className={`${btn} h-12`} onClick={() => onDir('RIGHT')}>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
