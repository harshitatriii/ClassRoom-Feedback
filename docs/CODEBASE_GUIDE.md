# Codebase Reading Guide

A file-by-file walkthrough for someone new to this project. You don't need to be an expert in Django or React — this guide explains what each file does and the best order to read them in.

---

## How This Project Works (30-Second Version)

This is a **feedback system for a university**. Students submit ratings and written feedback about their subjects. The backend automatically runs sentiment analysis (positive/negative/neutral) on the text. Faculty see analytics about their subjects. Admins manage everything.

**Two separate apps talk to each other:**

```
React Frontend (port 5173)  ---HTTP requests--->  Django Backend (port 8000)
    (what users see)                                (API + database + AI)
```

The frontend sends API requests (`/api/...`), the backend processes them, talks to the database, and sends JSON back.

---

## Reading Order

### Start Here: The Big Picture

| Order | File | What It Does |
|-------|------|-------------|
| 1 | `PROJECT_PLAN.md` | Overall architecture, database schema, API endpoints, and phased development plan. Read this first for context. |
| 2 | `CHANGELOG.md` | Summary of the university hierarchy restructuring (School -> Program -> Subject). |

---

### Part 1: Backend — Django Project Setup

> **What is Django?** A Python web framework. It organizes code into "apps" (folders), each handling a specific feature. The project has 5 apps: `accounts`, `courses`, `feedback`, `analysis`, `core`.

| Order | File | What It Does |
|-------|------|-------------|
| 3 | `smartClassroom/manage.py` | Django's command-line entry point. You run `python manage.py runserver` to start the server, `python manage.py migrate` to set up the database, etc. You never edit this file. |
| 4 | `smartClassroom/smartClassroom/settings.py` | **Project configuration.** Lists all installed apps, database settings, middleware, authentication setup. Look at `INSTALLED_APPS` to see what's plugged in (DRF, CORS, our custom apps). `AUTH_USER_MODEL` points to our custom user. |
| 5 | `smartClassroom/smartClassroom/urls.py` | **The URL router.** Maps URL paths to apps. Think of it as a table of contents: `/admin/` goes to Django admin, `/api/auth/` goes to accounts app, `/api/` goes to courses/feedback/analysis. |

---

### Part 2: Backend — Data Models (The Database Tables)

> **What are models?** Python classes that become database tables. Each class = one table. Each field = one column. Django creates the SQL for you.

**Read these in this order — they build on each other:**

| Order | File | What It Does |
|-------|------|-------------|
| 6 | `smartClassroom/courses/models.py` | **The university hierarchy.** Three models: `School` (like SOET), `Program` (like B.Tech, belongs to a School), `Subject` (like "Data Structures", belongs to a Program + has a faculty assigned). This is the backbone of the data model. |
| 7 | `smartClassroom/accounts/models.py` | **The user model.** Extends Django's built-in user with `role` (student/faculty/admin), `school` (FK to School), `program` (FK to Program, students only), `current_semester`, `enrollment_no`, `faculty_id`, `phone`. |
| 8 | `smartClassroom/feedback/models.py` | **Feedback entries.** Links a `student` to a `subject` with four 1-5 ratings (teaching, content, engagement, overall) plus free-text feedback. `unique_together` prevents a student from submitting twice for the same subject. |
| 9 | `smartClassroom/analysis/models.py` | **Sentiment results.** One-to-one with Feedback. Stores the AI analysis output: polarity, subjectivity, sentiment label, keywords, and category scores. |

**How they connect:**
```
School  --(has many)-->  Program  --(has many)-->  Subject  --(has many)-->  Feedback
                                                     |                         |
                                                 (taught by)            (submitted by)
                                                     |                         |
                                                  Faculty                   Student
                                                     |                         |
                                              (belongs to School)    (belongs to School +
                                                                      Program + Semester)
```

---

### Part 3: Backend — Serializers (Data In/Out Conversion)

> **What are serializers?** They convert between Python objects and JSON. When the frontend sends JSON, the serializer validates it and turns it into a Python object. When the backend returns data, the serializer turns Python objects into JSON. Think of them as "translators" + "validators".

| Order | File | What It Does |
|-------|------|-------------|
| 10 | `smartClassroom/courses/serializers.py` | Converts School/Program/Subject models to/from JSON. The "List" variants include related info (e.g., SubjectListSerializer includes the program name and faculty name). SubjectSerializer validates that semester doesn't exceed the program's `total_semesters`. |
| 11 | `smartClassroom/accounts/serializers.py` | Three serializers: `UserRegistrationSerializer` (validates registration — checks program belongs to school, semester is valid), `UserProfileSerializer` (returns user info with school/program details), `UserMinimalSerializer` (lightweight version for embedding in other responses). |
| 12 | `smartClassroom/feedback/serializers.py` | `FeedbackCreateSerializer` handles submission (validates ratings 1-5, checks for duplicate submissions). `FeedbackDetailSerializer` returns full feedback with subject details and sentiment data. |
| 13 | `smartClassroom/analysis/serializers.py` | Simple serializer for SentimentResult — just converts the model fields to JSON. |

---

### Part 4: Backend — Views (The API Logic)

> **What are views?** They handle HTTP requests. When someone hits `GET /api/subjects/`, a view function runs, queries the database, and returns JSON. DRF "ViewSets" are classes that auto-generate CRUD endpoints (list, create, retrieve, update, delete).

| Order | File | What It Does |
|-------|------|-------------|
| 14 | `smartClassroom/accounts/permissions.py` | **Permission classes.** Simple checks: `IsStudent` returns true if the logged-in user's role is "student". Same for `IsFaculty`, `IsAdminUser`, `IsFacultyOrAdmin`. Views use these to restrict access. |
| 15 | `smartClassroom/accounts/api_views.py` | **Auth endpoints.** `RegisterView` creates a user + returns a token. `LoginView` checks credentials + returns a token. `LogoutView` deletes the token. `ProfileView` returns/updates the logged-in user's info. |
| 16 | `smartClassroom/courses/views.py` | **Three ViewSets** for School, Program, Subject CRUD. Key logic: `SubjectViewSet.get_queryset()` auto-filters — students see only their program + semester's subjects, faculty see only subjects they teach, admin sees everything. Supports query params like `?school=1&program=2&semester=5`. |
| 17 | `smartClassroom/feedback/views.py` | `FeedbackViewSet` — students can create feedback, faculty see feedback for their subjects, admin sees all. Uses `select_related` to efficiently load subject/student data in one query. |
| 18 | `smartClassroom/analysis/views.py` | **Three analytics views.** `DashboardStatsView` returns role-specific counts (e.g., student sees their feedback count; admin sees total schools/programs/subjects). `SubjectSentimentView` returns sentiment breakdown for a specific subject. `SchoolAnalyticsView` returns school-wide analytics. |

---

### Part 5: Backend — URL Routing (Wiring Views to URLs)

| Order | File | What It Does |
|-------|------|-------------|
| 19 | `smartClassroom/accounts/api_urls.py` | Maps `/api/auth/register/`, `/api/auth/login/`, `/api/auth/logout/`, `/api/auth/profile/` to auth views. |
| 20 | `smartClassroom/courses/urls.py` | Uses DRF's `DefaultRouter` to auto-generate REST URLs: `/api/schools/`, `/api/programs/`, `/api/subjects/` (each with `/<id>/` detail endpoints). |
| 21 | `smartClassroom/feedback/urls.py` | Router generates `/api/feedback/` and `/api/feedback/<id>/`. |
| 22 | `smartClassroom/analysis/urls.py` | Maps `/api/dashboard/stats/`, `/api/analysis/subject/<id>/`, `/api/analysis/school/`. |

---

### Part 6: Backend — The AI/NLP Pipeline

| Order | File | What It Does |
|-------|------|-------------|
| 23 | `smartClassroom/analysis/sentiment.py` | **The AI engine.** Takes a text string, runs TextBlob on it, returns: polarity (-1 to 1), subjectivity (0 to 1), sentiment label (positive/neutral/negative), keywords (noun phrases), and category scores (how much the text mentions teaching/content/engagement topics). |
| 24 | `smartClassroom/feedback/signals.py` | **The trigger.** Uses Django's `post_save` signal — every time a Feedback is saved to the database, this automatically calls `analyze_sentiment()` and creates a SentimentResult. No manual step needed. |

**The flow:**
```
Student submits feedback  -->  Feedback saved to DB  -->  post_save signal fires
  -->  analyze_sentiment(text)  -->  SentimentResult created  -->  Available in dashboard
```

---

### Part 7: Backend — Admin & Seed Data

| Order | File | What It Does |
|-------|------|-------------|
| 25 | `smartClassroom/courses/admin.py` | Registers School, Program, Subject in Django's admin panel (`/admin/`). Configures which columns show in the list view, search fields, and filters. |
| 26 | `smartClassroom/accounts/admin.py` | Registers CustomUser in admin with school/program/semester fields in the edit form. |
| 27 | `smartClassroom/feedback/admin.py` | Registers Feedback in admin, shows student/subject/ratings/sentiment in list view. |
| 28 | `smartClassroom/analysis/admin.py` | Registers SentimentResult in admin. |
| 29 | `smartClassroom/seed_data.py` | **Run this to populate sample data.** Creates 2 schools, 3 programs, 3 faculty, 5 students, 1 admin, 5 subjects, 13 feedback entries with auto-generated sentiment. Run with `python seed_data.py`. |

---

### Part 8: Frontend — Setup & Config

> **What is React?** A JavaScript library for building UIs with reusable components. **Vite** is the dev server + build tool. **Tailwind CSS** is a utility-first CSS framework (you style with class names like `bg-blue-600 text-white`).

| Order | File | What It Does |
|-------|------|-------------|
| 30 | `frontend/vite.config.js` | Dev server config. The `proxy` setting is key — it forwards `/api/*` requests from the React dev server (port 5173) to Django (port 8000). This avoids CORS issues during development. |
| 31 | `frontend/src/main.jsx` | React entry point. Renders the `<App />` component into the HTML page. Nothing complex here. |

---

### Part 9: Frontend — API Layer (Talking to the Backend)

> These files use **Axios** (an HTTP client library) to make API calls. Each file groups related API calls together.

| Order | File | What It Does |
|-------|------|-------------|
| 32 | `frontend/src/api/client.js` | **The HTTP client.** Creates an Axios instance with base URL `/api`. Two interceptors: (1) automatically attaches the auth token to every request, (2) redirects to login if a 401 (unauthorized) response comes back. All other API files import this. |
| 33 | `frontend/src/api/auth.js` | Functions: `registerUser()`, `loginUser()`, `logoutUser()`, `getProfile()`, `updateProfile()`. Each is a one-liner calling the client. |
| 34 | `frontend/src/api/courses.js` | Functions for schools (`getSchools`, `createSchool`, etc.), programs (`getPrograms`, etc.), and subjects (`getSubjects`, `createSubject`, etc.). |
| 35 | `frontend/src/api/feedback.js` | `submitFeedback()`, `getFeedbacks()`, `getFeedbackDetail()`, `deleteFeedback()`. |
| 36 | `frontend/src/api/dashboard.js` | `getDashboardStats()`, `getSubjectAnalytics(id)`, `getSchoolAnalytics(params)`. |

---

### Part 10: Frontend — Auth & Routing

| Order | File | What It Does |
|-------|------|-------------|
| 37 | `frontend/src/context/AuthContext.jsx` | **Global auth state.** Stores the current user and token. On page load, checks if a token exists in localStorage and fetches the user profile. Provides `login()` and `logout()` functions to all components via React Context. |
| 38 | `frontend/src/hooks/useAuth.js` | A one-liner hook that makes accessing AuthContext easier: `const { user, login, logout } = useAuth()`. |
| 39 | `frontend/src/App.jsx` | **The router.** Defines all URL paths and which component renders for each. Wraps everything in `AuthProvider`. Uses `ProtectedRoute` (must be logged in) and `RoleRoute` (must have specific role) to guard routes. |
| 40 | `frontend/src/components/ui/ProtectedRoute.jsx` | If user is not logged in, redirects to `/login`. Otherwise, renders the child routes. |
| 41 | `frontend/src/components/ui/RoleRoute.jsx` | If user's role doesn't match the required roles, redirects to home. Otherwise, renders the child routes. |

---

### Part 11: Frontend — Layout

| Order | File | What It Does |
|-------|------|-------------|
| 42 | `frontend/src/components/layout/AppLayout.jsx` | The page shell — renders Sidebar on the left + TopBar on top + page content in the center. |
| 43 | `frontend/src/components/layout/Sidebar.jsx` | Navigation menu. Shows different links based on user role (student sees "My Subjects" + "Submit Feedback", faculty sees "My Subjects" + "Analytics", admin sees "Dashboard" + "Manage Subjects"). |
| 44 | `frontend/src/components/layout/TopBar.jsx` | Top bar with the app title and logout button. |

---

### Part 12: Frontend — Pages (Read by Role)

#### Auth Pages
| Order | File | What It Does |
|-------|------|-------------|
| 45 | `frontend/src/pages/auth/LoginPage.jsx` | Login form. Calls `login()` from AuthContext, then redirects to the role-specific dashboard. |
| 46 | `frontend/src/pages/auth/RegisterPage.jsx` | Registration form with **cascading dropdowns**: select a School -> Program dropdown filters to that school's programs -> Semester dropdown shows 1 to `program.total_semesters`. Students need all three; faculty just needs school. |

#### Student Pages
| Order | File | What It Does |
|-------|------|-------------|
| 47 | `frontend/src/pages/student/StudentDashboard.jsx` | Shows stat cards (feedback count, subjects, avg rating) and a list of recent feedback. |
| 48 | `frontend/src/pages/student/FeedbackForm.jsx` | Feedback submission form: select a subject (auto-filtered to student's program + semester), rate 1-5 stars on four categories, write text feedback, toggle anonymous. |
| 49 | `frontend/src/pages/student/FeedbackHistory.jsx` | Table of all feedback the student has submitted, with sentiment labels shown. |

#### Faculty Pages
| Order | File | What It Does |
|-------|------|-------------|
| 50 | `frontend/src/pages/faculty/FacultyDashboard.jsx` | Sentiment distribution pie chart across all subjects + list of faculty's subjects with links to detailed analytics. |
| 51 | `frontend/src/pages/faculty/CourseAnalytics.jsx` | Deep-dive analytics for one subject: sentiment trend over time (line chart), rating breakdown (bar chart), keyword cloud, and individual feedback list. |

#### Admin Pages
| Order | File | What It Does |
|-------|------|-------------|
| 52 | `frontend/src/pages/admin/AdminDashboard.jsx` | System-wide stats (total users, subjects, feedback), subject comparison bar chart, and school analytics table. |
| 53 | `frontend/src/pages/admin/CourseManagement.jsx` | CRUD table for subjects — list all subjects with edit/delete buttons and an "Add Subject" button. |
| 54 | `frontend/src/pages/admin/CourseForm.jsx` | The create/edit form for subjects. Cascading dropdowns: School -> Program, plus semester, faculty, academic year, and active toggle. |

#### Shared Pages
| Order | File | What It Does |
|-------|------|-------------|
| 55 | `frontend/src/pages/shared/CourseList.jsx` | Lists all subjects the user can see (role-filtered by the backend). Shows code, name, school, program, semester. |
| 56 | `frontend/src/pages/shared/CourseDetail.jsx` | Detail view for a single subject: school, program, semester, academic year, faculty name, active status. |
| 57 | `frontend/src/pages/shared/FeedbackDetail.jsx` | Full view of one feedback entry: star ratings, written feedback, and sentiment analysis results (polarity, subjectivity, label, keywords). |
| 58 | `frontend/src/pages/shared/ProfilePage.jsx` | User profile page. Shows read-only school/program/semester info and an editable form for name/email/phone. |
| 59 | `frontend/src/pages/shared/NotFound.jsx` | 404 page. |

---

### Part 13: Frontend — Reusable Components

| Order | File | What It Does |
|-------|------|-------------|
| 60 | `frontend/src/components/ui/StarRating.jsx` | Interactive 1-5 star rating input used in FeedbackForm. |
| 61 | `frontend/src/components/ui/StatCard.jsx` | A card showing a number + label (e.g., "12 Total Feedback"). Used on dashboards. |
| 62 | `frontend/src/components/ui/LoadingSpinner.jsx` | A spinner shown while data is loading. |
| 63 | `frontend/src/components/charts/SentimentPieChart.jsx` | Recharts pie chart showing positive/neutral/negative distribution. |
| 64 | `frontend/src/components/charts/RatingBarChart.jsx` | Recharts bar chart comparing average ratings across categories. |
| 65 | `frontend/src/components/charts/TrendLineChart.jsx` | Recharts line chart showing sentiment trend over time. |
| 66 | `frontend/src/components/charts/KeywordCloud.jsx` | Displays extracted keywords as colored tags. |

---

## Quick Reference: Key Concepts

### How Authentication Works
1. User logs in -> backend creates a **Token** (random string) and returns it
2. Frontend stores the token in `localStorage`
3. Every API request includes `Authorization: Token <token>` in the header (handled by `client.js`)
4. Backend checks the token on each request to identify the user
5. Logout = delete the token from both localStorage and the backend

### How Role-Based Access Works
- **Backend**: Views check `request.user.role` using permission classes (`IsStudent`, `IsFaculty`, etc.)
- **Frontend**: Routes are wrapped in `<RoleRoute roles={['student']}>` to show/hide pages
- **Data filtering**: Backend queryset filters ensure users only see their own data (e.g., students only see subjects in their program + semester)

### How Sentiment Analysis Works
1. Student submits feedback with text
2. Django `post_save` signal fires automatically
3. `analyze_sentiment()` runs TextBlob on the text
4. Results (polarity, subjectivity, keywords, category scores) are saved as a `SentimentResult`
5. Dashboards query these results for charts and analytics

### The University Hierarchy
```
School (e.g., SOET)
  └── Program (e.g., B.Tech, 8 semesters)
        └── Subject (e.g., Data Structures, semester 5)
              └── Feedback (one per student per subject)
```
- Students belong to: School + Program + Current Semester
- Faculty belongs to: School (teaches specific Subjects)
- Admins: see everything, no school/program restriction

---

## How to Run the Project

**Terminal 1 — Backend:**
```bash
cd smartClassroom
source venv/Scripts/activate    # On Windows Git Bash
pip install -r requirements.txt
python manage.py migrate
python seed_data.py             # Optional: load sample data
python manage.py runserver      # http://localhost:8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

Open `http://localhost:5173` in your browser.

**Sample login credentials (after running seed_data.py):**
- Admin: `admin` / `admin1234`
- Faculty: `faculty1` / `faculty1234`
- Student: `student1` / `student1234`
