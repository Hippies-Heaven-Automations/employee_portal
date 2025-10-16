# 🧾 Employee Portal Database Documentation

## 📘 Overview & Architecture
This document contains the complete SQL schema, RLS policies, functions, triggers, and views for the **Employee Portal** built on Supabase (PostgreSQL). It includes the employee, training, and shift management systems — all with secure Row-Level Security (RLS) and admin override features.

---

## 🧱 Core Tables

### 1️⃣ `profiles` (employees & admins)
```sql
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  contact_number text,
  address text,
  emergency_contact text,
  role text check (role in ('admin', 'employee')) default 'employee',
  username text unique,
  password text,
  employee_type text check (employee_type in ('VA', 'Store')) default 'VA',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**Purpose:** Stores all employees and admin users.  
**Notes:**
- `employee_type` distinguishes VA vs Store staff.
- Enforces unique emails and usernames.
- Protected by RLS (users can view their own, admins can view all).

---

### 2️⃣ `applications`
```sql
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  contact_number text,
  message text,
  preferred_interview_date date,
  preferred_interview_time text,
  resume_url text,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Public-facing job applications. No RLS (open form submissions).

---

### 3️⃣ `announcements`
```sql
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**RLS Policies:**
- Everyone can `SELECT` (view announcements).
- Only admins can `INSERT`, `UPDATE`, `DELETE`.

---

### 4️⃣ `schedules`
Stores assigned work schedules.

```sql
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.profiles(id) on delete cascade,
  date date not null,
  time_in time not null,
  time_out time not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

### 5️⃣ `time_off_requests` & `vacation_requests`
Both tables track employee leave or vacation requests.

```sql
create table if not exists public.time_off_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  status text default 'pending',
  created_at timestamptz default now()
);
```

```sql
create table if not exists public.vacation_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  status text default 'pending',
  created_at timestamptz default now()
);
```

---

### 6️⃣ `paystubs`
Tracks employee pay periods and attached files.

```sql
create table if not exists public.paystubs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.profiles(id) on delete cascade,
  pay_period_start date not null,
  pay_period_end date not null,
  amount numeric(10,2),
  file_url text,
  created_at timestamptz default now()
);
```

---

## 🎓 Training System

### 7️⃣ `trainings`
```sql
create table if not exists public.trainings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text,
  quiz_url text,
  created_at timestamptz default now()
);
```

### 8️⃣ `training_tracker`
Logs employee training completions.

```sql
create table if not exists public.training_tracker (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.profiles(id) on delete cascade,
  training_id uuid references public.trainings(id) on delete cascade,
  completed_at timestamptz default now(),
  quiz_score numeric(5,2),
  certificate_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (employee_id, training_id)
);
```

### 9️⃣ `training_summary` (View)
Combines `profiles`, `trainings`, and `training_tracker` for reporting.

```sql
create or replace view public.training_summary as
select
  p.full_name as employee_name,
  tr.title as training_title,
  t.quiz_score,
  t.completed_at,
  t.certificate_url
from public.training_tracker t
join public.profiles p on p.id = t.employee_id
join public.trainings tr on tr.id = t.training_id;
```

### 🔔 `training_completion_log` + Trigger
Logs each training completion (insert or update).

```sql
create table if not exists public.training_completion_log (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.profiles(id) on delete cascade,
  training_id uuid references public.trainings(id) on delete cascade,
  completed_at timestamptz default now(),
  message text
);
```

Trigger Function:
```sql
create or replace function public.log_training_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  emp_name text;
  train_title text;
begin
  select full_name into emp_name from public.profiles where id = new.employee_id;
  select title into train_title from public.trainings where id = new.training_id;
  insert into public.training_completion_log (employee_id, training_id, message)
  values (new.employee_id, new.training_id, format('✅ %s completed "%s" training on %s', emp_name, train_title, to_char(new.completed_at, 'YYYY-MM-DD HH24:MI')));
  return new;
end;
$$;
```

Trigger:
```sql
create trigger on_training_completion
after insert or update on public.training_tracker
for each row
execute function public.log_training_completion();
```

---

## 🕒 Shift Management System

### 🔹 `shift_logs`
```sql
create table if not exists public.shift_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.profiles(id) on delete cascade,
  shift_start timestamptz,
  shift_end timestamptz,
  duration interval generated always as (shift_end - shift_start) stored,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 🔹 Prevent duplicate open shifts
```sql
create unique index if not exists one_open_shift_per_employee
on public.shift_logs (employee_id)
where shift_end is null;
```

### 🔹 Trigger Function: prevent_duplicate_shift
```sql
create or replace function public.prevent_duplicate_shift()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_open_shift uuid;
  current_user_id uuid;
  is_admin boolean := false;
begin
  begin
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid into current_user_id;
  exception when others then
    current_user_id := null;
  end;
  if current_user_id is not null then
    select public.has_role(current_user_id, 'admin') into is_admin;
  end if;
  if not is_admin then
    select id into existing_open_shift
    from public.shift_logs
    where employee_id = new.employee_id
      and shift_end is null
    limit 1;
    if existing_open_shift is not null then
      raise exception '🚫 You already have an active shift (ID: %). Please end it before starting a new one.', existing_open_shift;
    end if;
  end if;
  return new;
end;
$$;
```

Trigger:
```sql
create trigger check_duplicate_shift
before insert on public.shift_logs
for each row
execute function public.prevent_duplicate_shift();
```

---

### 🔹 Admin Insert/Edit Function
```sql
create or replace function public.admin_add_or_update_shift(
  _employee_id uuid,
  _shift_start timestamptz,
  _shift_end timestamptz,
  _notes text default null,
  _shift_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare _id uuid;
begin
  if _shift_id is null then
    insert into public.shift_logs (employee_id, shift_start, shift_end, notes)
    values (_employee_id, _shift_start, _shift_end, _notes)
    returning id into _id;
  else
    update public.shift_logs
    set shift_start = _shift_start,
        shift_end = _shift_end,
        notes = _notes,
        updated_at = now()
    where id = _shift_id
    returning id into _id;
  end if;
  return _id;
end;
$$;
```

---

### 🔹 `shift_edit_log` (Admin Audit Trail)
```sql
create table if not exists public.shift_edit_log (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid references public.shift_logs(id) on delete cascade,
  edited_by uuid references public.profiles(id) on delete cascade,
  action text check (action in ('insert', 'update', 'delete')),
  notes text,
  edited_at timestamptz default now()
);
```

Trigger Function:
```sql
create or replace function public.log_admin_shift_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare _user_id uuid := auth.uid(); _is_admin boolean;
begin
  select public.has_role(_user_id, 'admin') into _is_admin;
  if _is_admin then
    if tg_op = 'INSERT' then
      insert into public.shift_edit_log (shift_id, edited_by, action, notes)
      values (new.id, _user_id, 'insert', new.notes);
    elsif tg_op = 'UPDATE' then
      insert into public.shift_edit_log (shift_id, edited_by, action, notes)
      values (new.id, _user_id, 'update', new.notes);
    elsif tg_op = 'DELETE' then
      insert into public.shift_edit_log (shift_id, edited_by, action, notes)
      values (old.id, _user_id, 'delete', old.notes);
    end if;
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;
```

Trigger:
```sql
create trigger log_shift_changes
after insert or update or delete on public.shift_logs
for each row
execute function public.log_admin_shift_change();
```

---

## 🔒 Role-Based Security (RLS)

### 🔹 General Policies
- Employees: can only `SELECT` or `UPDATE` their own records.  
- Admins: full `ALL` access with `WITH CHECK` condition validating admin role.

### 🔹 Example RLS Pattern
```sql
create policy "Employees can view their own data" on public.profiles
  for select using (auth.uid() = id);

create policy "Admins can manage all users" on public.profiles
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
```

---

## 🧭 Future Expansion Notes

- ✅ **employee_type** column ready for dashboard conditions (VA vs Store).
- 🧠 Add `security_policies` table later in UI logic (dynamic visibility).
- 🔔 Optional automation: n8n can monitor `shift_edit_log` or `training_completion_log` for notifications.

---

**Author:** Chris Albea  
**Generated by:** ChatGPT (GPT-5)  
**Date:** 2025-10-16  
**File:** `employee_portal_schema.md`
