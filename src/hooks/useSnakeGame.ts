import { useCallback, useEffect, useRef, useState } from 'react';

export type Point = { x: number; y: number };
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const GRID_SIZE = 20;

const DIRECTION_VECTORS: Record<Direction, Point> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const OPPOSITE: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

const LEVEL_UP_SCORE = 50;

function randomFood(snake: Point[]): Point {
  while (true) {
    const food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    if (!snake.some((s) => s.x === food.x && s.y === food.y)) return food;
  }
}

function initialSnake(): Point[] {
  const cx = Math.floor(GRID_SIZE / 2);
  const cy = Math.floor(GRID_SIZE / 2);
  return [
    { x: cx, y: cy },
    { x: cx - 1, y: cy },
    { x: cx - 2, y: cy },
  ];
}

export type GameStatus = 'idle' | 'running' | 'paused' | 'over';

export function useSnakeGame() {
  const [snake, setSnake] = useState<Point[]>(initialSnake);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [status, setStatus] = useState<GameStatus>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const directionRef = useRef<Direction>('RIGHT');
  const queuedDirectionRef = useRef<Direction | null>(null);
  const snakeRef = useRef<Point[]>(snake);
  const foodRef = useRef<Point>(food);
  const statusRef = useRef<GameStatus>(status);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);
  useEffect(() => {
    foodRef.current = food;
  }, [food]);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const tick = useCallback(() => {
    if (statusRef.current !== 'running') return;

    if (queuedDirectionRef.current) {
      const next = queuedDirectionRef.current;
      if (next !== OPPOSITE[directionRef.current]) {
        directionRef.current = next;
        setDirection(next);
      }
      queuedDirectionRef.current = null;
    }

    const dir = directionRef.current;
    const vector = DIRECTION_VECTORS[dir];
    const current = snakeRef.current;
    const head = current[0];
    const newHead = { x: head.x + vector.x, y: head.y + vector.y };

    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE
    ) {
      setStatus('over');
      return;
    }

    const willEat = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
    const bodyToCheck = willEat ? current : current.slice(0, -1);
    if (bodyToCheck.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      setStatus('over');
      return;
    }

    const newSnake = [newHead, ...current];
    if (willEat) {
      setFood(randomFood(current));
      setScore((s) => {
        const ns = s + 10;
        setLevel((l) => (ns >= l * LEVEL_UP_SCORE ? l + 1 : l));
        return ns;
      });
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  }, []);

  const speed = Math.max(70, 180 - (level - 1) * 12);

  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(tick, speed);
    return () => clearInterval(id);
  }, [status, speed, tick]);

  const setQueuedDirection = useCallback((dir: Direction) => {
    if (statusRef.current !== 'running') return;
    if (dir === OPPOSITE[directionRef.current]) return;
    queuedDirectionRef.current = dir;
  }, []);

  const start = useCallback(() => {
    const s = initialSnake();
    setSnake(s);
    snakeRef.current = s;
    const f = randomFood(s);
    setFood(f);
    foodRef.current = f;
    directionRef.current = 'RIGHT';
    queuedDirectionRef.current = null;
    setDirection('RIGHT');
    setScore(0);
    setLevel(1);
    setStatus('running');
  }, []);

  const pause = useCallback(() => {
    if (statusRef.current === 'running') setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (statusRef.current === 'paused') setStatus('running');
  }, []);

  const togglePause = useCallback(() => {
    if (statusRef.current === 'running') setStatus('paused');
    else if (statusRef.current === 'paused') setStatus('running');
  }, []);

  return {
    snake,
    food,
    direction,
    status,
    score,
    level,
    speed,
    setQueuedDirection,
    start,
    pause,
    resume,
    togglePause,
  };
}
