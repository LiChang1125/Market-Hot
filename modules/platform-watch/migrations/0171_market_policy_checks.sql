CREATE TABLE market_policy_checks (
  platform text NOT NULL,
  checked_at timestamptz NOT NULL,
  state text NOT NULL CHECK (state IN ('baseline','changed','unchanged','failed')),
  fingerprint text,
  evidence jsonb NOT NULL,
  previous_evidence jsonb NOT NULL,
  PRIMARY KEY(platform, checked_at)
);
