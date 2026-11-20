// Cada item é uma migração (lista de comandos). Nunca edite uma migração já publicada: acrescente outra.
export const MIGRATIONS: string[][] = [
  [
    `create table users (
      id text primary key,
      email text not null unique,
      name text not null,
      password_hash text not null,
      created_at timestamptz not null default now()
    )`,
    `create table sessions (
      token_hash text primary key,
      user_id text not null references users(id) on delete cascade,
      expires_at timestamptz not null
    )`,
    `create table events (
      id text primary key,
      user_id text not null references users(id) on delete cascade,
      slug text not null unique,
      type text not null,
      template text not null,
      title text not null,
      headline text not null default '',
      message text not null default '',
      event_date text not null,
      event_time text not null default '',
      venue_name text not null default '',
      address text not null default '',
      dress_code text not null default '',
      rsvp_deadline text not null default '',
      extra_info text not null default '',
      gift_message text not null default '',
      gift_links jsonb not null default '[]',
      pix_key_type text not null default '',
      pix_key text not null default '',
      pix_holder text not null default '',
      pix_city text not null default '',
      open_rsvp boolean not null default true,
      plan text not null default 'free',
      upgrade_requested_at timestamptz,
      created_at timestamptz not null default now()
    )`,
    `create index events_user_idx on events(user_id)`,
    `create table guests (
      id text primary key,
      event_id text not null references events(id) on delete cascade,
      token text not null,
      name text not null,
      phone text not null default '',
      max_people int not null default 1,
      status text not null default 'pending',
      people_count int not null default 0,
      note text not null default '',
      source text not null default 'host',
      sent_at timestamptz,
      opened_at timestamptz,
      open_count int not null default 0,
      responded_at timestamptz,
      created_at timestamptz not null default now(),
      unique (event_id, token)
    )`,
    `create index guests_event_idx on guests(event_id)`,
  ],
  [
    `create table payments (
      id text primary key,
      event_id text not null references events(id) on delete cascade,
      provider text not null,
      provider_payment_id text not null,
      status text not null,
      amount numeric(10,2) not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (provider, provider_payment_id)
    )`,
  ],
  [`alter table events add column palette text not null default ''`],
];
