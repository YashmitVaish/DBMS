-- Attendance Management System (PostgreSQL)
-- Schema initialized by docker-compose volume mount.
-- NOTE: Postgres init scripts run only on FIRST DB init (empty volume).
-- If you changed this file and nothing happens, remove the pgdata volume.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -------------------------------------------------
-- ENUM TYPES
-- -------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin', 'dept_head');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- -------------------------------------------------
-- CORE TABLES
-- -------------------------------------------------

CREATE TABLE IF NOT EXISTS departments (
    department_id   SERIAL          PRIMARY KEY,
    name            VARCHAR(200)    NOT NULL,
    code            VARCHAR(20)     NOT NULL UNIQUE,
    head_user_id    UUID,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    user_id         UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(150)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   TEXT            NOT NULL,
    role            user_role       NOT NULL,
    phone           VARCHAR(20),
    department_id   INT             REFERENCES departments(department_id) ON DELETE SET NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
    ALTER TABLE departments
        ADD CONSTRAINT fk_dept_head
        FOREIGN KEY (head_user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS academic_periods (
    period_id   SERIAL          PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    start_date  DATE            NOT NULL,
    end_date    DATE            NOT NULL,
    is_active   BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_period_dates CHECK (end_date > start_date)
);

CREATE TABLE IF NOT EXISTS courses (
    course_id       SERIAL          PRIMARY KEY,
    code            VARCHAR(20)     NOT NULL UNIQUE,
    name            VARCHAR(200)    NOT NULL,
    department_id   INT             NOT NULL REFERENCES departments(department_id),
    credits         SMALLINT        NOT NULL CHECK (credits BETWEEN 1 AND 10),
    max_students    INT             NOT NULL DEFAULT 60,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_enrollments (
    student_id      UUID            NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    course_id       INT             NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    enrolled_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,

    PRIMARY KEY (student_id, course_id)
);

CREATE TABLE IF NOT EXISTS course_teachers (
    teacher_id      UUID            NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    course_id       INT             NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    period_id       INT             NOT NULL REFERENCES academic_periods(period_id),
    assigned_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    PRIMARY KEY (teacher_id, course_id, period_id)
);

CREATE TABLE IF NOT EXISTS attendance (
    attendance_id   SERIAL              PRIMARY KEY,
    student_id      UUID                NOT NULL REFERENCES users(user_id),
    course_id       INT                 NOT NULL REFERENCES courses(course_id),
    period_id       INT                 NOT NULL REFERENCES academic_periods(period_id),
    date            DATE                NOT NULL,
    status          attendance_status   NOT NULL,
    marked_by       UUID                REFERENCES users(user_id) ON DELETE SET NULL,
    remarks         TEXT,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_student_course_date UNIQUE (student_id, course_id, date)
);

CREATE TABLE IF NOT EXISTS attendance_audit_log (
    log_id          SERIAL              PRIMARY KEY,
    attendance_id   INT                 NOT NULL REFERENCES attendance(attendance_id) ON DELETE CASCADE,
    changed_by      UUID                REFERENCES users(user_id) ON DELETE SET NULL,
    old_status      attendance_status,
    new_status      attendance_status,
    change_reason   TEXT,
    changed_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_thresholds (
    threshold_id    SERIAL          PRIMARY KEY,
    course_id       INT             NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    period_id       INT             NOT NULL REFERENCES academic_periods(period_id) ON DELETE CASCADE,
    min_percentage  NUMERIC(5,2)    NOT NULL DEFAULT 75.00,

    CONSTRAINT uq_course_period_threshold UNIQUE (course_id, period_id)
);

-- -------------------------------------------------
-- TRIGGERS
-- -------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_attendance_updated_at ON attendance;
CREATE TRIGGER trg_attendance_updated_at
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION audit_attendance_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO attendance_audit_log
            (attendance_id, changed_by, old_status, new_status, change_reason)
        VALUES
            (NEW.attendance_id, NEW.marked_by, OLD.status, NEW.status, NEW.remarks);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_attendance ON attendance;
CREATE TRIGGER trg_audit_attendance
    AFTER UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION audit_attendance_change();

CREATE OR REPLACE FUNCTION prevent_inactive_student_attendance()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_active BOOLEAN;
BEGIN
    SELECT is_active INTO v_active
    FROM users WHERE user_id = NEW.student_id;

    IF v_active IS DISTINCT FROM TRUE THEN
        RAISE EXCEPTION 'Cannot mark attendance for inactive student %', NEW.student_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_student_active ON attendance;
CREATE TRIGGER trg_check_student_active
    BEFORE INSERT ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION prevent_inactive_student_attendance();

-- -------------------------------------------------
-- INDEXES
-- -------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_attendance_student
    ON attendance(student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_course_date
    ON attendance(course_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_course_period
    ON attendance(course_id, period_id);

CREATE INDEX IF NOT EXISTS idx_attendance_student_course_period
    ON attendance(student_id, course_id, period_id);

CREATE INDEX IF NOT EXISTS idx_attendance_status
    ON attendance(status);

CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_role
    ON users(role);

CREATE INDEX IF NOT EXISTS idx_users_department
    ON users(department_id);

CREATE INDEX IF NOT EXISTS idx_active_students
    ON users(user_id)
    WHERE role = 'student' AND is_active = TRUE;

-- -------------------------------------------------
-- VIEWS
-- -------------------------------------------------

CREATE OR REPLACE VIEW daily_attendance_report AS
SELECT
    a.date,
    c.code        AS course_code,
    c.name        AS course_name,
    u.user_id     AS student_id,
    u.name        AS student_name,
    a.status,
    a.marked_by,
    mb.email      AS marked_by_email,
    a.remarks
FROM attendance a
JOIN users u ON u.user_id = a.student_id
JOIN courses c ON c.course_id = a.course_id
LEFT JOIN users mb ON mb.user_id = a.marked_by;

CREATE OR REPLACE VIEW student_attendance_by_course AS
SELECT
    c.course_id,
    c.code                    AS course_code,
    c.name                    AS course_name,
    a.period_id,
    u.user_id                 AS student_id,
    u.name                    AS student_name,
    COUNT(a.attendance_id)::INT AS total_classes,
    COUNT(a.attendance_id) FILTER (WHERE a.status IN ('present','late'))::INT AS attended,
    ROUND(
        100.0 * COUNT(a.attendance_id) FILTER (WHERE a.status IN ('present','late'))
        / NULLIF(COUNT(a.attendance_id), 0),
    2) AS attendance_percentage
FROM attendance a
JOIN users u ON u.user_id = a.student_id
JOIN courses c ON c.course_id = a.course_id
GROUP BY c.course_id, c.code, c.name, a.period_id, u.user_id, u.name;

-- -------------------------------------------------
-- STORED PROCEDURES / FUNCTIONS
-- -------------------------------------------------

CREATE OR REPLACE PROCEDURE bulk_mark_attendance(
    p_course_id     INT,
    p_period_id     INT,
    p_date          DATE,
    p_student_ids   UUID[],
    p_statuses      attendance_status[],
    p_marked_by     UUID,
    p_remarks       TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_i     INT;
    v_count INT;
BEGIN
    IF array_length(p_student_ids, 1) != array_length(p_statuses, 1) THEN
        RAISE EXCEPTION 'student_ids and statuses arrays must have equal length';
    END IF;

    v_count := array_length(p_student_ids, 1);

    FOR v_i IN 1..v_count LOOP
        INSERT INTO attendance (student_id, course_id, period_id, date, status, marked_by, remarks)
        VALUES (p_student_ids[v_i], p_course_id, p_period_id, p_date, p_statuses[v_i], p_marked_by, p_remarks)
        ON CONFLICT (student_id, course_id, date)
        DO UPDATE SET
            status     = EXCLUDED.status,
            period_id  = EXCLUDED.period_id,
            marked_by  = EXCLUDED.marked_by,
            remarks    = EXCLUDED.remarks,
            updated_at = NOW();
    END LOOP;

    RAISE NOTICE 'Bulk attendance marked for % students on %', v_count, p_date;
END;
$$;

CREATE OR REPLACE FUNCTION check_attendance_below_threshold(
    p_course_id  INT,
    p_period_id  INT
)
RETURNS TABLE (
    student_id      UUID,
    student_name    VARCHAR,
    email           VARCHAR,
    total_classes   INT,
    attended        INT,
    percentage      NUMERIC(5,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_min_pct NUMERIC(5,2);
BEGIN
    SELECT COALESCE(t.min_percentage, 75.00)
    INTO v_min_pct
    FROM attendance_thresholds t
    WHERE t.course_id = p_course_id AND t.period_id = p_period_id
    LIMIT 1;

    RETURN QUERY
    SELECT
        u.user_id,
        u.name,
        u.email,
        COUNT(a.attendance_id)::INT AS total_classes,
        COUNT(a.attendance_id) FILTER (WHERE a.status IN ('present','late'))::INT AS attended,
        ROUND(
            100.0 * COUNT(a.attendance_id) FILTER (WHERE a.status IN ('present','late'))
            / NULLIF(COUNT(a.attendance_id), 0),
        2) AS percentage
    FROM users u
    JOIN course_enrollments ce
      ON ce.student_id = u.user_id AND ce.course_id = p_course_id
    LEFT JOIN attendance a
      ON a.student_id = u.user_id
     AND a.course_id  = p_course_id
     AND a.period_id  = p_period_id
    WHERE u.role = 'student'
      AND u.is_active = TRUE
      AND ce.is_active = TRUE
    GROUP BY u.user_id, u.name, u.email
    HAVING
        ROUND(
            100.0 * COUNT(a.attendance_id) FILTER (WHERE a.status IN ('present','late'))
            / NULLIF(COUNT(a.attendance_id), 0),
        2) < v_min_pct
    ORDER BY percentage ASC;
END;
$$;

CREATE OR REPLACE FUNCTION generate_attendance_report(
    p_student_id UUID,
    p_period_id  INT
)
RETURNS TABLE (
    course_code         VARCHAR,
    course_name         VARCHAR,
    total_classes       INT,
    present_count       INT,
    absent_count        INT,
    late_count          INT,
    excused_count       INT,
    attendance_pct      NUMERIC(5,2),
    threshold_pct       NUMERIC(5,2),
    is_below_threshold  BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.code,
        c.name,
        COUNT(a.attendance_id)::INT,
        COUNT(*) FILTER (WHERE a.status = 'present')::INT,
        COUNT(*) FILTER (WHERE a.status = 'absent')::INT,
        COUNT(*) FILTER (WHERE a.status = 'late')::INT,
        COUNT(*) FILTER (WHERE a.status = 'excused')::INT,
        ROUND(
            100.0 * COUNT(*) FILTER (WHERE a.status IN ('present','late'))
            / NULLIF(COUNT(a.attendance_id), 0),
        2) AS attendance_pct,
        COALESCE(t.min_percentage, 75.00) AS threshold_pct,
        ROUND(
            100.0 * COUNT(*) FILTER (WHERE a.status IN ('present','late'))
            / NULLIF(COUNT(a.attendance_id), 0),
        2) < COALESCE(t.min_percentage, 75.00) AS is_below_threshold
    FROM courses c
    JOIN course_enrollments ce
      ON ce.course_id = c.course_id AND ce.student_id = p_student_id AND ce.is_active = TRUE
    LEFT JOIN attendance a
      ON a.course_id   = c.course_id
     AND a.student_id  = p_student_id
     AND a.period_id   = p_period_id
    LEFT JOIN attendance_thresholds t
      ON t.course_id = c.course_id AND t.period_id = p_period_id
    GROUP BY c.code, c.name, t.min_percentage;
END;
$$;

CREATE OR REPLACE PROCEDURE update_attendance_with_audit(
    p_attendance_id INT,
    p_new_status    attendance_status,
    p_changed_by    UUID,
    p_reason        TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_old_status attendance_status;
BEGIN
    SELECT status INTO v_old_status
    FROM attendance
    WHERE attendance_id = p_attendance_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Attendance record % not found', p_attendance_id;
    END IF;

    IF v_old_status = p_new_status THEN
        RAISE NOTICE 'No change needed; status already %', p_new_status;
        RETURN;
    END IF;

    UPDATE attendance
    SET status     = p_new_status,
        marked_by  = p_changed_by,
        remarks    = p_reason,
        updated_at = NOW()
    WHERE attendance_id = p_attendance_id;

    INSERT INTO attendance_audit_log
        (attendance_id, changed_by, old_status, new_status, change_reason)
    VALUES
        (p_attendance_id, p_changed_by, v_old_status, p_new_status, p_reason);
END;
$$;

-- -------------------------------------------------
-- ROW LEVEL SECURITY (attendance)
-- Backend sets session vars via set_config:
--   app.current_user_id, app.current_user_role
-- -------------------------------------------------

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS attendance_admin_all ON attendance;
CREATE POLICY attendance_admin_all ON attendance
    FOR ALL
    USING (current_setting('app.current_user_role', true) = 'admin')
    WITH CHECK (current_setting('app.current_user_role', true) = 'admin');

DROP POLICY IF EXISTS attendance_student_read ON attendance;
CREATE POLICY attendance_student_read ON attendance
    FOR SELECT
    USING (
        current_setting('app.current_user_role', true) = 'student'
        AND student_id = nullif(current_setting('app.current_user_id', true), '')::UUID
    );

DROP POLICY IF EXISTS attendance_teacher_all ON attendance;
CREATE POLICY attendance_teacher_all ON attendance
    FOR ALL
    USING (
        current_setting('app.current_user_role', true) = 'teacher'
        AND EXISTS (
            SELECT 1 FROM course_teachers ct
            WHERE ct.teacher_id = nullif(current_setting('app.current_user_id', true), '')::UUID
              AND ct.course_id  = attendance.course_id
              AND ct.period_id  = attendance.period_id
        )
    )
    WITH CHECK (
        current_setting('app.current_user_role', true) = 'teacher'
        AND EXISTS (
            SELECT 1 FROM course_teachers ct
            WHERE ct.teacher_id = nullif(current_setting('app.current_user_id', true), '')::UUID
              AND ct.course_id  = course_id
              AND ct.period_id  = period_id
        )
    );

DROP POLICY IF EXISTS attendance_dept_head_read ON attendance;
CREATE POLICY attendance_dept_head_read ON attendance
    FOR SELECT
    USING (
        current_setting('app.current_user_role', true) = 'dept_head'
        AND EXISTS (
            SELECT 1
            FROM courses c
            JOIN departments d ON d.department_id = c.department_id
            WHERE c.course_id = attendance.course_id
              AND d.head_user_id = nullif(current_setting('app.current_user_id', true), '')::UUID
        )
    );

-- -------------------------------------------------
-- APP DB USER (non-superuser) so RLS actually applies
-- -------------------------------------------------
DO $$ BEGIN
    CREATE ROLE app_user LOGIN PASSWORD 'yourpassword';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

GRANT USAGE ON SCHEMA public TO app_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON
    departments,
    users,
    academic_periods,
    courses,
    course_enrollments,
    course_teachers,
    attendance,
    attendance_audit_log,
    attendance_thresholds
TO app_user;

GRANT SELECT ON daily_attendance_report, student_attendance_by_course TO app_user;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

GRANT EXECUTE ON PROCEDURE bulk_mark_attendance(INT, INT, DATE, UUID[], attendance_status[], UUID, TEXT) TO app_user;
GRANT EXECUTE ON PROCEDURE update_attendance_with_audit(INT, attendance_status, UUID, TEXT) TO app_user;
GRANT EXECUTE ON FUNCTION check_attendance_below_threshold(INT, INT) TO app_user;
GRANT EXECUTE ON FUNCTION generate_attendance_report(UUID, INT) TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO app_user;

COMMIT;
