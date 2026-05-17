-- Bedlek Tarım — Supabase Tablo Şeması
-- Supabase Dashboard > SQL Editor'de çalıştır

-- Tek tablo: her localStorage key'i bir satır
create table if not exists store (
  key text primary key,
  value jsonb not null,
  guncelleme timestamptz default now()
);

-- RLS'yi kapat (özel, tek kullanıcı uygulaması)
alter table store disable row level security;
