CREATE TABLE IF NOT EXISTS accounts (
    uid text PRIMARY KEY,
    username text NOT NULL,
    display_name text NOT NULL DEFAULT '',
    last_seen timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sheets (
    owner_uid text PRIMARY KEY REFERENCES accounts(uid),
    form jsonb NOT NULL DEFAULT '{}'::jsonb,
    revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (jsonb_typeof(form) = 'object')
);
