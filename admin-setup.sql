-- ============================================================
-- MKT Portal — setup do painel de administração (rodar uma vez)
-- Cole tudo no Supabase > SQL Editor e clique em RUN.
-- Projeto: yuqidbvfilomxkwaaerl
-- ============================================================

-- 1) BANNERS: coluna de posição (topo | rodape | ambos)
alter table public.sponsors add column if not exists position text not null default 'ambos';
alter table public.sponsors drop constraint if exists sponsors_position_chk;
alter table public.sponsors add constraint sponsors_position_chk check (position in ('topo','meio','rodape','ambos'));

-- 2) ADMINS: quem pode editar. O PRIMEIRO usuário que criar conta vira admin automaticamente.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
drop policy if exists "admin le admins" on public.admins;
create policy "admin le admins" on public.admins for select to authenticated using (true);

create or replace function public.is_admin() returns boolean
language sql security definer stable as $$
  select exists(select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.grant_first_admin() returns trigger
language plpgsql security definer as $$
begin
  if (select count(*) from public.admins) = 0 then
    insert into public.admins(user_id) values (new.id);
  end if;
  return new;
end;
$$;
drop trigger if exists trg_grant_first_admin on auth.users;
create trigger trg_grant_first_admin after insert on auth.users
  for each row execute function public.grant_first_admin();

-- 3) CONFIGURAÇÕES DO SITE (chave/valor) — textos editáveis
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
drop policy if exists "todos leem settings" on public.site_settings;
create policy "todos leem settings" on public.site_settings for select using (true);
drop policy if exists "admin edita settings" on public.site_settings;
create policy "admin edita settings" on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings(key, value) values
  ('tagline', 'O portal de notícias e atualizações do <b>Marketing 2.0</b> <i>- Muito mais que uma agência</i>'),
  ('wa1', '5511934503566'),
  ('wa2', '5513996820331'),
  ('instagram', 'https://instagram.com/marketing2ponto0'),
  ('facebook', 'https://facebook.com/marketing2ponto0'),
  ('telegram', 'https://t.me/marketing2ponto0'),
  ('threads', 'https://threads.net/@marketing2ponto0'),
  ('devby_url', 'https://www.marketing2ponto0.com.br')
on conflict (key) do nothing;

-- 4) PERMISSÕES DE ESCRITA (admin) nas tabelas
-- sponsors: leitura pública só dos ativos; admin faz tudo
drop policy if exists "admin edita sponsors" on public.sponsors;
create policy "admin edita sponsors" on public.sponsors for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- articles: mantém leitura pública; admin cria/edita/exclui
drop policy if exists "admin edita articles" on public.articles;
create policy "admin edita articles" on public.articles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 4b) GUIAS/MARCAS (faixa de destaques estilo Instagram)
create table if not exists public.brands (
  id bigint generated always as identity primary key,
  name text not null,
  logo_url text,
  instagram_url text,
  active boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.brands enable row level security;
drop policy if exists "todos leem brands" on public.brands;
create policy "todos leem brands" on public.brands for select using (active = true);
drop policy if exists "admin edita brands" on public.brands;
create policy "admin edita brands" on public.brands for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

insert into public.brands(name, instagram_url, sort) values
  ('Guia Bacia do Juquery', 'https://instagram.com/guiabaciadojuquery', 1),
  ('Guia Est. de São Paulo', 'https://instagram.com/guiaestadodesaopaulo', 2),
  ('Guia Litoral SP', 'https://instagram.com/guialitoralsp', 3),
  ('Guia Só Curtindo a Vida', 'https://instagram.com/guiasocurtindoavida', 4),
  ('O Futuro Político', 'https://instagram.com/ofuturopolitico', 5),
  ('Marketing 2.0', 'https://instagram.com/marketing2ponto0', 6)
on conflict do nothing;

-- 5) STORAGE: bucket público "banners" (capas, galeria, anúncios e logos de marca)
insert into storage.buckets (id, name, public) values ('banners','banners', true)
on conflict (id) do update set public = true;

drop policy if exists "banners leitura publica" on storage.objects;
create policy "banners leitura publica" on storage.objects for select using (bucket_id = 'banners');

drop policy if exists "banners admin grava" on storage.objects;
create policy "banners admin grava" on storage.objects for insert to authenticated
  with check (bucket_id = 'banners' and public.is_admin());
drop policy if exists "banners admin atualiza" on storage.objects;
create policy "banners admin atualiza" on storage.objects for update to authenticated
  using (bucket_id = 'banners' and public.is_admin());
drop policy if exists "banners admin apaga" on storage.objects;
create policy "banners admin apaga" on storage.objects for delete to authenticated
  using (bucket_id = 'banners' and public.is_admin());

-- Pronto. Agora abra o admin.html, clique em "Primeiro acesso" e crie sua conta
-- com seu e-mail — essa primeira conta vira admin automaticamente.
