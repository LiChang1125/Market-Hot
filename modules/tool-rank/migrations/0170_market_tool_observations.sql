CREATE TABLE market_tool_observations (
  slug text NOT NULL,
  day date NOT NULL,
  checked_at timestamptz NOT NULL,
  observation jsonb NOT NULL,
  PRIMARY KEY (slug, day)
);
