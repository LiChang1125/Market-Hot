CREATE TABLE market_reader_accounts (
  id uuid PRIMARY KEY,
  login_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
