# AttendX — Attendance Management System Frontend

A production-quality React frontend for the Attendance Management System, built with Vite, React Router, Axios, Recharts, and React Hook Form.

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 + Vite | UI framework + build tool |
| React Router v6 | Client-side routing |
| Axios | HTTP client with interceptors |
| Recharts | Charts and data visualization |
| React Hook Form | Form validation |
| React Hot Toast | Toast notifications |
| Lucide React | Icon system |
| Date-fns | Date formatting |

## Folder Structure

```
src/
├── components/
│   ├── common/          # Reusable UI atoms
│   │   ├── Badge.jsx    # StatusBadge, RoleBadge, PctBadge
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── DataTable.jsx
│   │   ├── FormField.jsx  # Input, Select, FormField wrapper
│   │   ├── Modal.jsx
│   │   ├── Spinner.jsx
│   │   └── StatCard.jsx
│   └── layout/
│       ├── AppLayout.jsx  # Root layout (sidebar + topbar)
│       ├── Sidebar.jsx    # Collapsible navigation
│       └── Topbar.jsx     # Top header bar
├── context/
│   └── AuthContext.jsx    # Auth state + login/logout
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── UsersPage.jsx
│   ├── CoursesPage.jsx
│   ├── AttendancePage.jsx    # Bulk mark attendance
│   ├── DailyReportPage.jsx
│   ├── StudentReportsPage.jsx
│   ├── LowAttendancePage.jsx
│   ├── AdminPage.jsx         # Enroll + assign teacher
│   └── NotFoundPage.jsx
├── services/              # API layer (no UI code)
│   ├── api.js             # Axios instance + interceptors
│   ├── authService.js
│   ├── userService.js
│   ├── courseService.js
│   ├── attendanceService.js
│   ├── reportService.js
│   └── adminService.js
├── utils/
│   └── helpers.js         # formatDate, getErrorMessage, etc.
├── App.jsx                # Routes + providers
├── main.jsx               # Entry point
└── index.css              # CSS variables + global styles
```

## Setup

### Prerequisites
- Node.js 18+
- Backend running at `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Start dev server (runs on port 3000)
npm run dev

# Build for production
npm run build
```

### Environment
The Vite dev server proxies `/api` to `http://localhost:8000`.
The Axios base URL is set directly to `http://localhost:8000`.

To change the backend URL, edit `src/services/api.js`:
```js
const api = axios.create({
  baseURL: 'http://your-backend-url',
})
```

## Features by Role

### Admin
- Dashboard with full stats (users, courses, attendance breakdown)
- User Management: list and create users of any role
- Course Management: list and create courses
- Mark Attendance: bulk mark for any course/date
- Daily Report: filter by date
- Student Reports: search and view any student's report
- Low Attendance: identify at-risk students by course/period
- Admin Panel: enroll students, assign teachers to courses

### Teacher
- Dashboard with today's attendance stats and charts
- View all courses
- Mark attendance (bulk)
- Daily reports
- Student reports (read any student)
- Low attendance alerts

### Student
- Dashboard with personal attendance chart
- View courses
- Own attendance report (by period)

### Dept Head
- Dashboard
- View courses
- Student reports
- Low attendance monitoring

## API Mapping

| Endpoint | Page |
|----------|------|
| POST /auth/login | LoginPage |
| GET /users/me | AuthContext |
| GET /users | UsersPage |
| POST /users | UsersPage modal |
| GET /courses | CoursesPage |
| POST /courses | CoursesPage modal |
| POST /attendance/bulk | AttendancePage |
| GET /reports/daily | DailyReportPage |
| GET /reports/student/me | StudentReportsPage (student) |
| GET /reports/student/{id} | StudentReportsPage (admin/teacher) |
| GET /reports/low-attendance | LowAttendancePage |
| POST /admin/enroll | AdminPage |
| POST /admin/assign-teacher | AdminPage |

## Assumptions

1. **Period IDs**: The API uses integer period IDs. The UI defaults to period `1` and lets users type the ID manually, since there is no `/periods` listing endpoint in the API.
2. **Student listing for attendance**: The `/users` (admin-only) endpoint is used to list students for the bulk mark page. Teachers marking attendance must be admin or the endpoint must return their students.
3. **Enrollment before report**: Student reports will be empty if the student isn't enrolled in any courses.
4. **Auth token**: Stored in `localStorage` as `access_token`. On 401, the user is redirected to `/login`.
