/*
# Create snake_scores table (single-tenant, no auth)

1. New Tables
- `snake_scores`
  - `id` (uuid, primary key)
  - `player_name` (text, not null) — name entered by the player
  - `score` (integer, not null) — final score achieved
  - `level` (integer, not null) — level reached
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `snake_scores`.
- Allow anon + authenticated to read all scores (public leaderboard) and insert new scores.
- No updates or deletes from the client (leaderboard integrity).
3. Indexes
- Index on `score` DESC for fast leaderboard queries.
*/

CREATE TABLE IF NOT EXISTS snake_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL CHECK (length(player_name) BETWEEN 1 AND 20),
  score integer NOT NULL CHECK (score >= 0),
  level integer NOT NULL CHECK (level >= 1),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS snake_scores_score_desc_idx ON snake_scores (score DESC);

ALTER TABLE snake_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_scores" ON snake_scores;
CREATE POLICY "anon_select_scores" ON snake_scores FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scores" ON snake_scores;
CREATE POLICY "anon_insert_scores" ON snake_scores FOR INSERT
  TO anon, authenticated WITH CHECK (true);
