-- =============================================================================
-- Continental Bank — Recovery-first escrow platform
-- =============================================================================
-- Adds the recovery case -> KYC -> private escrow -> release review flow.
-- Critical custody and fee fields remain admin/backend/provider controlled.
-- =============================================================================

-- Withdrawal enum expansion for escrow release requests.
do $$ begin
  alter type public.withdrawal_status add value if not exists 'draft';
  alter type public.withdrawal_status add value if not exists 'submitted';
  alter type public.withdrawal_status add value if not exists 'pending_review';
  alter type public.withdrawal_status add value if not exists 'awaiting_fee_completion';
  alter type public.withdrawal_status add value if not exists 'approved_for_processing';
  alter type public.withdrawal_status add value if not exists 'processing';
  alter type public.withdrawal_status add value if not exists 'paid';
  alter type public.withdrawal_status add value if not exists 'failed';
  alter type public.withdrawal_status add value if not exists 'cancelled';
end $$;

-- Profile fields required by the recovery-first escrow model.
alter table public.profiles
  add column if not exists company text,
  add column if not exists is_verified boolean not null default false,
  add column if not exists escrow_account_status text not null default 'not_started',
  add column if not exists escrow_account_reference text unique,
  add column if not exists escrow_account_opened_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_escrow_account_status_check;
alter table public.profiles
  add constraint profiles_escrow_account_status_check
  check (escrow_account_status in ('not_started', 'active'));

update public.profiles
set is_verified = true
where kyc_status = 'approved' and is_verified = false;

-- Keep client-side profile edits from changing protected recovery/escrow fields.
create or replace function public.profile_privileged_fields_unchanged(
  target_id uuid,
  next_role public.user_role,
  next_account_status public.account_status,
  next_kyc_status public.kyc_status,
  next_kyc_method public.kyc_method,
  next_kyc_document_name text,
  next_kyc_document_path text,
  next_kyc_document_mime_type text,
  next_kyc_submitted_at timestamptz,
  next_kyc_reviewed_at timestamptz,
  next_kyc_reviewed_by_admin_id uuid,
  next_kyc_review_note text,
  next_is_verified boolean,
  next_escrow_account_status text,
  next_escrow_account_reference text,
  next_escrow_account_opened_at timestamptz
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = target_id
      and p.role = next_role
      and p.account_status = next_account_status
      and p.kyc_status = next_kyc_status
      and p.kyc_method is not distinct from next_kyc_method
      and p.kyc_document_name is not distinct from next_kyc_document_name
      and p.kyc_document_path is not distinct from next_kyc_document_path
      and p.kyc_document_mime_type is not distinct from next_kyc_document_mime_type
      and p.kyc_submitted_at is not distinct from next_kyc_submitted_at
      and p.kyc_reviewed_at is not distinct from next_kyc_reviewed_at
      and p.kyc_reviewed_by_admin_id is not distinct from next_kyc_reviewed_by_admin_id
      and p.kyc_review_note is not distinct from next_kyc_review_note
      and p.is_verified is not distinct from next_is_verified
      and p.escrow_account_status is not distinct from next_escrow_account_status
      and p.escrow_account_reference is not distinct from next_escrow_account_reference
      and p.escrow_account_opened_at is not distinct from next_escrow_account_opened_at
  );
$$;

drop policy if exists "profiles_update_self_limited" on public.profiles;
create policy "profiles_update_self_limited" on public.profiles
  for update using (auth.uid() = id) with check (
    auth.uid() = id
    and public.profile_privileged_fields_unchanged(
      id,
      role,
      account_status,
      kyc_status,
      kyc_method,
      kyc_document_name,
      kyc_document_path,
      kyc_document_mime_type,
      kyc_submitted_at,
      kyc_reviewed_at,
      kyc_reviewed_by_admin_id,
      kyc_review_note,
      is_verified,
      escrow_account_status,
      escrow_account_reference,
      escrow_account_opened_at
    )
  );

-- ---------------------------------------------------------------------------
-- Recovery cases
-- ---------------------------------------------------------------------------
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  complaint_type text not null,
  summary text not null,
  evidence_summary text,
  counterparty_name text,
  counterparty_contact text,
  amount_claimed numeric(18, 2) not null default 0 check (amount_claimed >= 0),
  currency public.currency_code not null default 'USD',
  status text not null default 'submitted',
  assigned_to_admin_id uuid references public.profiles(id) on delete set null,
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cases_status_check check (
    status in (
      'draft',
      'submitted',
      'under_review',
      'accepted',
      'rejected',
      'assigned',
      'recovered',
      'closed'
    )
  )
);

create index if not exists cases_user_idx on public.cases(user_id, created_at desc);
create index if not exists cases_status_idx on public.cases(status, created_at desc);

drop trigger if exists cases_updated_at on public.cases;
create trigger cases_updated_at
  before update on public.cases
  for each row execute function public.set_updated_at();

create table if not exists public.case_parties (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text,
  phone text,
  company text,
  role text not null default 'counterparty',
  created_at timestamptz not null default now(),
  constraint case_parties_role_check check (
    role in ('claimant', 'counterparty', 'beneficiary', 'provider', 'legal_representative', 'other')
  )
);

create index if not exists case_parties_case_idx on public.case_parties(case_id);

-- ---------------------------------------------------------------------------
-- Evidence, KYC submission records, reviews, escrow contracts, recovered funds
-- ---------------------------------------------------------------------------
create table if not exists public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  method public.kyc_method not null,
  status text not null default 'pending_review',
  document_file_id uuid,
  notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by_admin_id uuid references public.profiles(id) on delete set null,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kyc_submissions_status_check check (
    status in ('not_started', 'pending_review', 'verified', 'declined', 'resubmission_required')
  )
);

create index if not exists kyc_submissions_user_idx on public.kyc_submissions(user_id, created_at desc);
create index if not exists kyc_submissions_status_idx on public.kyc_submissions(status);

drop trigger if exists kyc_submissions_updated_at on public.kyc_submissions;
create trigger kyc_submissions_updated_at
  before update on public.kyc_submissions
  for each row execute function public.set_updated_at();

create table if not exists public.uploaded_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  case_id uuid references public.cases(id) on delete cascade,
  kyc_submission_id uuid references public.kyc_submissions(id) on delete set null,
  file_kind text not null,
  bucket text not null,
  path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  visibility text not null default 'private',
  created_at timestamptz not null default now(),
  constraint uploaded_files_kind_check check (
    file_kind in ('evidence', 'kyc', 'receipt', 'admin_document', 'message_attachment')
  ),
  constraint uploaded_files_visibility_check check (visibility in ('private', 'admin_only'))
);

create index if not exists uploaded_files_user_idx on public.uploaded_files(user_id, created_at desc);
create index if not exists uploaded_files_case_idx on public.uploaded_files(case_id);
create index if not exists uploaded_files_kyc_idx on public.uploaded_files(kyc_submission_id);

alter table public.kyc_submissions
  drop constraint if exists kyc_submissions_document_file_id_fkey;
alter table public.kyc_submissions
  add constraint kyc_submissions_document_file_id_fkey
  foreign key (document_file_id) references public.uploaded_files(id) on delete set null
  deferrable initially deferred;

create table if not exists public.recovery_kyc_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kyc_submission_id uuid references public.kyc_submissions(id) on delete set null,
  admin_id uuid not null references public.profiles(id) on delete cascade,
  decision text not null,
  note text,
  created_at timestamptz not null default now(),
  constraint recovery_kyc_reviews_decision_check check (
    decision in ('verified', 'declined', 'resubmission_required')
  )
);

create index if not exists recovery_kyc_reviews_user_idx on public.recovery_kyc_reviews(user_id, created_at desc);

create table if not exists public.escrow_contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  case_id uuid not null references public.cases(id) on delete cascade,
  reference text not null unique,
  status text not null default 'pending_setup',
  release_status text not null default 'not_eligible',
  release_conditions_open boolean not null default false,
  provider_reference text,
  currency public.currency_code not null default 'USD',
  total_recovered numeric(18, 2) not null default 0 check (total_recovered >= 0),
  available_for_withdrawal numeric(18, 2) not null default 0 check (available_for_withdrawal >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint escrow_contracts_status_check check (
    status in ('draft', 'pending_setup', 'active', 'ready_for_release', 'release_approved', 'frozen', 'closed')
  ),
  constraint escrow_contracts_release_status_check check (
    release_status in ('not_eligible', 'eligible', 'blocked', 'under_review')
  )
);

create index if not exists escrow_contracts_user_idx on public.escrow_contracts(user_id, created_at desc);
create index if not exists escrow_contracts_case_idx on public.escrow_contracts(case_id);
create index if not exists escrow_contracts_status_idx on public.escrow_contracts(status, release_status);

drop trigger if exists escrow_contracts_updated_at on public.escrow_contracts;
create trigger escrow_contracts_updated_at
  before update on public.escrow_contracts
  for each row execute function public.set_updated_at();

create table if not exists public.recovered_funds_entries (
  id uuid primary key default gen_random_uuid(),
  escrow_contract_id uuid not null references public.escrow_contracts(id) on delete cascade,
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  currency public.currency_code not null,
  amount numeric(18, 2) not null check (amount > 0),
  source text,
  provider_reference text,
  note text,
  recorded_by_admin_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists recovered_funds_entries_user_idx on public.recovered_funds_entries(user_id, created_at desc);
create index if not exists recovered_funds_entries_contract_idx on public.recovered_funds_entries(escrow_contract_id);

create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  case_id uuid references public.cases(id) on delete cascade,
  escrow_contract_id uuid references public.escrow_contracts(id) on delete cascade,
  status text not null default 'open',
  title text not null,
  description text not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint disputes_status_check check (status in ('open', 'under_review', 'resolved', 'closed'))
);

create index if not exists disputes_user_idx on public.disputes(user_id, created_at desc);
create index if not exists disputes_status_idx on public.disputes(status);

drop trigger if exists disputes_updated_at on public.disputes;
create trigger disputes_updated_at
  before update on public.disputes
  for each row execute function public.set_updated_at();

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  case_id uuid references public.cases(id) on delete cascade,
  escrow_contract_id uuid references public.escrow_contracts(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_user_idx on public.messages(user_id, created_at desc);
create index if not exists messages_case_idx on public.messages(case_id, created_at desc);
create index if not exists messages_escrow_idx on public.messages(escrow_contract_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Withdrawal requests now support escrow release review and fee verification.
-- ---------------------------------------------------------------------------
alter table public.withdrawal_requests
  add column if not exists case_id uuid references public.cases(id) on delete set null,
  add column if not exists escrow_contract_id uuid references public.escrow_contracts(id) on delete set null,
  add column if not exists release_processing_fee numeric(18, 2) not null default 0,
  add column if not exists release_processing_fee_percentage numeric(5, 2) not null default 20.00,
  add column if not exists net_amount numeric(18, 2),
  add column if not exists fee_status text not null default 'unpaid',
  add column if not exists release_status text not null default 'not_eligible',
  add column if not exists provider_status text,
  add column if not exists provider_reference text;

alter table public.withdrawal_requests
  drop constraint if exists withdrawal_requests_fee_status_check;
alter table public.withdrawal_requests
  add constraint withdrawal_requests_fee_status_check
  check (fee_status in ('unpaid', 'pending_verification', 'completed'));

alter table public.withdrawal_requests
  drop constraint if exists withdrawal_requests_release_status_check;
alter table public.withdrawal_requests
  add constraint withdrawal_requests_release_status_check
  check (release_status in ('not_eligible', 'eligible', 'blocked', 'under_review'));

create index if not exists wd_case_idx on public.withdrawal_requests(case_id);
create index if not exists wd_escrow_contract_idx on public.withdrawal_requests(escrow_contract_id);
create index if not exists wd_fee_status_idx on public.withdrawal_requests(fee_status);

drop policy if exists "wd_insert_self" on public.withdrawal_requests;
create policy "wd_insert_self" on public.withdrawal_requests
  for insert with check (
    auth.uid() = user_id
    and status = 'pending'
    and release_processing_fee = 0
    and coalesce(net_amount, amount) = amount
    and fee_status = 'unpaid'
  );

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.cases enable row level security;
alter table public.case_parties enable row level security;
alter table public.kyc_submissions enable row level security;
alter table public.uploaded_files enable row level security;
alter table public.recovery_kyc_reviews enable row level security;
alter table public.escrow_contracts enable row level security;
alter table public.recovered_funds_entries enable row level security;
alter table public.disputes enable row level security;
alter table public.messages enable row level security;

-- cases
drop policy if exists "cases_select_self_or_admin" on public.cases;
create policy "cases_select_self_or_admin" on public.cases
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "cases_insert_self" on public.cases;
create policy "cases_insert_self" on public.cases
  for insert with check (auth.uid() = user_id and status in ('draft', 'submitted'));

drop policy if exists "cases_update_admin_only" on public.cases;
create policy "cases_update_admin_only" on public.cases
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "cases_admin_delete" on public.cases;
create policy "cases_admin_delete" on public.cases
  for delete using (public.is_admin(auth.uid()));

-- case parties
drop policy if exists "case_parties_select_self_or_admin" on public.case_parties;
create policy "case_parties_select_self_or_admin" on public.case_parties
  for select using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.cases c
      where c.id = case_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "case_parties_insert_case_owner" on public.case_parties;
create policy "case_parties_insert_case_owner" on public.case_parties
  for insert with check (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.cases c
      where c.id = case_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "case_parties_admin_update" on public.case_parties;
create policy "case_parties_admin_update" on public.case_parties
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- kyc submissions
drop policy if exists "kyc_submissions_select_self_or_admin" on public.kyc_submissions;
create policy "kyc_submissions_select_self_or_admin" on public.kyc_submissions
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "kyc_submissions_insert_self" on public.kyc_submissions;
create policy "kyc_submissions_insert_self" on public.kyc_submissions
  for insert with check (auth.uid() = user_id and status = 'pending_review');

drop policy if exists "kyc_submissions_admin_update" on public.kyc_submissions;
create policy "kyc_submissions_admin_update" on public.kyc_submissions
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- uploaded files
drop policy if exists "uploaded_files_select_self_or_admin" on public.uploaded_files;
create policy "uploaded_files_select_self_or_admin" on public.uploaded_files
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "uploaded_files_insert_self_or_admin" on public.uploaded_files;
create policy "uploaded_files_insert_self_or_admin" on public.uploaded_files
  for insert with check (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "uploaded_files_admin_update" on public.uploaded_files;
create policy "uploaded_files_admin_update" on public.uploaded_files
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- recovery KYC reviews
drop policy if exists "recovery_kyc_reviews_select_self_or_admin" on public.recovery_kyc_reviews;
create policy "recovery_kyc_reviews_select_self_or_admin" on public.recovery_kyc_reviews
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "recovery_kyc_reviews_admin_insert" on public.recovery_kyc_reviews;
create policy "recovery_kyc_reviews_admin_insert" on public.recovery_kyc_reviews
  for insert with check (public.is_admin(auth.uid()) and auth.uid() = admin_id);

-- escrow contracts
drop policy if exists "escrow_contracts_select_self_or_admin" on public.escrow_contracts;
create policy "escrow_contracts_select_self_or_admin" on public.escrow_contracts
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "escrow_contracts_admin_all" on public.escrow_contracts;
create policy "escrow_contracts_admin_all" on public.escrow_contracts
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- recovered funds
drop policy if exists "recovered_funds_select_self_or_admin" on public.recovered_funds_entries;
create policy "recovered_funds_select_self_or_admin" on public.recovered_funds_entries
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "recovered_funds_admin_insert" on public.recovered_funds_entries;
create policy "recovered_funds_admin_insert" on public.recovered_funds_entries
  for insert with check (public.is_admin(auth.uid()));

-- disputes
drop policy if exists "disputes_select_self_or_admin" on public.disputes;
create policy "disputes_select_self_or_admin" on public.disputes
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "disputes_insert_self" on public.disputes;
create policy "disputes_insert_self" on public.disputes
  for insert with check (auth.uid() = user_id and status = 'open');

drop policy if exists "disputes_admin_update" on public.disputes;
create policy "disputes_admin_update" on public.disputes
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- messages
drop policy if exists "messages_select_self_or_admin" on public.messages;
create policy "messages_select_self_or_admin" on public.messages
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "messages_insert_participant_or_admin" on public.messages;
create policy "messages_insert_participant_or_admin" on public.messages
  for insert with check (
    (auth.uid() = user_id and auth.uid() = sender_id)
    or (public.is_admin(auth.uid()) and auth.uid() = sender_id)
  );
