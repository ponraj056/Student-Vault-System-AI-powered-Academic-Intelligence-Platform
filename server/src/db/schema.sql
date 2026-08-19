CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'faculty', 'hod', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  department TEXT,
  student_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_student_id_unique
  ON users (student_id) WHERE student_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_no TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  department TEXT NOT NULL,
  batch TEXT,
  year_of_study INTEGER,
  date_of_birth DATE,
  academic_status TEXT,
  cgpa NUMERIC(4, 3),
  attendance NUMERIC(5, 2),
  arrear_count INTEGER NOT NULL DEFAULT 0,
  nptel TEXT,
  vac TEXT,
  internships JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS students_department_idx ON students (department);
CREATE INDEX IF NOT EXISTS students_name_idx ON students (name);

CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status CHAR(1) NOT NULL CHECK (status IN ('P', 'A')),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  semester INTEGER,
  subject TEXT,
  subject_code TEXT,
  grade TEXT,
  grade_point NUMERIC(4, 2),
  gpa NUMERIC(4, 2),
  cgpa NUMERIC(4, 3),
  arrears INTEGER NOT NULL DEFAULT 0,
  result TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS results_student_idx ON results (student_id);

CREATE TABLE IF NOT EXISTS ai_cache (
  cache_key TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
