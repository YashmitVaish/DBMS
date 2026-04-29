-- Seed data for Attendance Management System
-- This runs only on FIRST DB init (empty volume).

BEGIN;

-- Department
INSERT INTO departments (name, code)
VALUES ('Computer Science', 'CS')
ON CONFLICT (code) DO NOTHING;

-- Academic period
INSERT INTO academic_periods (name, start_date, end_date, is_active)
SELECT 'Semester 1 2025-26', '2025-07-01', '2025-12-31', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM academic_periods WHERE name = 'Semester 1 2025-26'
);

-- Users (bcrypt via pgcrypto: crypt('password', gen_salt('bf', 12)))
INSERT INTO users (name, email, password_hash, role)
VALUES (
    'Admin User',
    'admin@university.edu',
    crypt('admin123', gen_salt('bf', 12)),
    'admin'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password_hash, role, department_id)
VALUES (
    'Dr. Sharma',
    'sharma@university.edu',
    crypt('depthead123', gen_salt('bf', 12)),
    'dept_head',
    (SELECT department_id FROM departments WHERE code='CS')
)
ON CONFLICT (email) DO NOTHING;

UPDATE departments
SET head_user_id = (SELECT user_id FROM users WHERE email='sharma@university.edu')
WHERE code = 'CS';

INSERT INTO users (name, email, password_hash, role, department_id)
VALUES (
    'Prof. Gupta',
    'gupta@university.edu',
    crypt('teacher123', gen_salt('bf', 12)),
    'teacher',
    (SELECT department_id FROM departments WHERE code='CS')
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password_hash, role, department_id)
VALUES
    ('Arjun Mehta',  'arjun@student.edu',  crypt('student123', gen_salt('bf', 12)), 'student', (SELECT department_id FROM departments WHERE code='CS')),
    ('Priya Singh',  'priya@student.edu',  crypt('student123', gen_salt('bf', 12)), 'student', (SELECT department_id FROM departments WHERE code='CS')),
    ('Rahul Nair',   'rahul@student.edu',  crypt('student123', gen_salt('bf', 12)), 'student', (SELECT department_id FROM departments WHERE code='CS'))
ON CONFLICT (email) DO NOTHING;

-- Course
INSERT INTO courses (code, name, department_id, credits)
VALUES (
    'CS301',
    'Database Management Systems',
    (SELECT department_id FROM departments WHERE code='CS'),
    4
)
ON CONFLICT (code) DO NOTHING;

-- Enroll students
INSERT INTO course_enrollments (student_id, course_id)
SELECT
    u.user_id,
    c.course_id
FROM users u
CROSS JOIN (SELECT course_id FROM courses WHERE code='CS301') c
WHERE u.role='student'
ON CONFLICT (student_id, course_id) DO UPDATE SET is_active = TRUE;

-- Assign teacher to course+period
INSERT INTO course_teachers (teacher_id, course_id, period_id)
VALUES (
    (SELECT user_id FROM users WHERE email='gupta@university.edu'),
    (SELECT course_id FROM courses WHERE code='CS301'),
    (SELECT period_id FROM academic_periods WHERE name='Semester 1 2025-26' LIMIT 1)
)
ON CONFLICT (teacher_id, course_id, period_id) DO NOTHING;

-- Threshold
INSERT INTO attendance_thresholds (course_id, period_id, min_percentage)
VALUES (
    (SELECT course_id FROM courses WHERE code='CS301'),
    (SELECT period_id FROM academic_periods WHERE name='Semester 1 2025-26' LIMIT 1),
    75.00
)
ON CONFLICT (course_id, period_id) DO UPDATE SET min_percentage = EXCLUDED.min_percentage;

-- A little attendance (optional)
INSERT INTO attendance (student_id, course_id, period_id, date, status, marked_by, remarks)
SELECT
    s.user_id,
    c.course_id,
    p.period_id,
    DATE '2026-04-28',
    'present',
    t.user_id,
    'seed'
FROM users s
CROSS JOIN (SELECT course_id FROM courses WHERE code='CS301') c
CROSS JOIN (SELECT period_id FROM academic_periods WHERE name='Semester 1 2025-26' LIMIT 1) p
CROSS JOIN (SELECT user_id FROM users WHERE email='gupta@university.edu') t
WHERE s.email IN ('arjun@student.edu','priya@student.edu')
ON CONFLICT (student_id, course_id, date) DO UPDATE SET status = EXCLUDED.status;

COMMIT;
