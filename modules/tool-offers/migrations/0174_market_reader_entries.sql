CREATE TABLE market_reader_entries (
  owner uuid NOT NULL REFERENCES market_reader_accounts(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('claim','star')),
  entry_key text NOT NULL,
  value jsonb NOT NULL,
  PRIMARY KEY (owner, kind, entry_key)
);
