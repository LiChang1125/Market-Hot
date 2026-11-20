CREATE TABLE market_reader_sessions (
  token_hash text PRIMARY KEY,
  owner uuid NOT NULL REFERENCES market_reader_accounts(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
