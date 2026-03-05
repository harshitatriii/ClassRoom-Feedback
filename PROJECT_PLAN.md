# Smart Classroom Feedback & Quality Monitoring System
## Project Plan, HLD & Phased Development Guide

---

## 1. HIGH-LEVEL DESIGN (HLD)

### 1.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND (React SPA)                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │ Student   │  │ Faculty      │  │ Admin Dashboard           │ │
│  │ Feedback  │  │ View Reports │  │ Analytics + Trends +      │ │
│  │ Forms     │  │ + Sentiment  │  │ Sentiment Scores + Charts │ │
│  └──────────┘  └──────────────┘  └───────────────────────────┘ │
│         React + Tailwind CSS + Recharts                         │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API (Token Auth)
┌────────────────────────▼────────────────────────────────────────┐
│               BACKEND (Django + DRF API)                        │
│  ┌────────────┐ ┌─────────────┐ ┌────────────────────────────┐ │
│  │ Auth &     │ │ Feedback    │ │ Analytics & Reporting      │ │
│  │ Role Mgmt  │ │ Collection  │ │ Module                     │ │
│  │ (Student/  │ │ + Validation│ │ (Aggregation, Trends,      │ │
│  │  Faculty/  │ │             │ │  Comparative Analysis)     │ │
│  │  Admin)    │ │             │ │                            │ │
│  └────────────┘ └──────┬──────┘ └────────────────────────────┘ │
│                        │                                        │
│              ┌─────────▼─────────┐                              │
│              │ AI/NLP Engine     │                              │
│              │ (TextBlob/NLTK)   │                              │
│              │ - Sentiment Score │                              │
│              │ - Keyword Extract │                              │
│              │ - Topic Classify  │                              │
│              └───────────────────┘                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    DATABASE (SQLite / PostgreSQL)                │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Users    │ │ Feedback  │ │ Courses  │ │ Sentiment        │ │
│  │  Table   │ │  Table    │ │  Table   │ │ Results Table    │ │
│  └──────────┘ └───────────┘ └──────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Module Breakdown

| Module               | Responsibility                                             |
|----------------------|------------------------------------------------------------|
| **Auth Module**      | Registration, login, role-based access (Student/Faculty/Admin) |
| **Feedback Module**  | Submit, view feedback (structured + free-text)             |
| **NLP/AI Module**    | Sentiment analysis, keyword extraction, topic classification |
| **Analytics Module** | Aggregate scores, trend charts, comparative reports         |
| **Dashboard Module** | Role-specific views, charts (Recharts), analytics          |
| **Admin Module**     | User management, course/subject CRUD, system config         |

### 1.3 Data Flow

```
Student submits feedback (React form → POST /api/feedback/)
        │
        ▼
  Feedback stored in DB (raw)
        │
        ▼
  NLP Engine processes text (post_save signal)
  ├── Sentiment score (positive/neutral/negative + polarity)
  ├── Keyword extraction (top topics mentioned)
  └── Category tagging (teaching/content/engagement)
        │
        ▼
  Results stored in DB (SentimentResult)
        │
        ▼
  Dashboard aggregates & visualizes (GET /api/analysis/*)
  ├── Faculty sees: own course sentiment trends
  ├── Admin sees: department-wide analytics, comparisons
  └── Student sees: own feedback history + sentiment
```

---

## 2. TECHNOLOGY DECISIONS

| Layer         | Choice                      | Rationale                                    |
|---------------|-----------------------------|----------------------------------------------|
| Backend       | Django 5.2 + DRF            | Robust ORM, built-in admin, REST API support |
| API           | Django REST Framework       | Token auth, serializers, viewsets, permissions|
| Database      | SQLite (dev) / PostgreSQL   | Django ORM, simple for dev, scalable for prod|
| NLP - Basic   | TextBlob                    | Simple, fast sentiment for MVP               |
| NLP - Advanced| NLTK + HuggingFace          | Better accuracy for later phases             |
| Frontend      | React (Vite)                | Modern SPA, component-based, fast dev cycle  |
| Charts        | Recharts                    | React-native charting, declarative JSX       |
| CSS Framework | Tailwind CSS                | Utility-first, rapid UI development          |
| Auth          | DRF Token Authentication    | Simple, server-side token, easy revocation   |
| CORS          | django-cors-headers         | Required for React dev server communication  |

---

## 3. PROJECT STRUCTURE

```
ClassRoom-Feedback/
├── smartClassroom/                  # Django project root (API backend)
│   ├── manage.py
│   ├── requirements.txt
│   ├── db.sqlite3
│   ├── smartClassroom/              # Project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── accounts/                    # App: Authentication & User Management
│   │   ├── models.py               # CustomUser (Student/Faculty/Admin roles)
│   │   ├── serializers.py          # User registration/login/profile serializers
│   │   ├── api_views.py            # DRF API views (register, login, logout, profile)
│   │   ├── api_urls.py             # API URL routes
│   │   ├── permissions.py          # DRF role-based permission classes
│   │   ├── decorators.py           # Role-based access decorators (legacy)
│   │   └── admin.py
│   │
│   ├── courses/                     # App: Course Management
│   │   ├── models.py               # Course model
│   │   ├── serializers.py          # Course serializers
│   │   ├── views.py                # CourseViewSet (CRUD)
│   │   ├── urls.py                 # DRF router URLs
│   │   └── admin.py
│   │
│   ├── feedback/                    # App: Feedback Collection
│   │   ├── models.py               # Feedback model
│   │   ├── serializers.py          # Feedback serializers
│   │   ├── views.py                # FeedbackViewSet
│   │   ├── urls.py                 # DRF router URLs
│   │   ├── signals.py              # Auto-trigger sentiment analysis
│   │   └── admin.py
│   │
│   ├── analysis/                    # App: NLP/AI Sentiment Engine
│   │   ├── sentiment.py            # TextBlob sentiment analysis
│   │   ├── models.py               # SentimentResult model
│   │   ├── serializers.py          # SentimentResult serializer
│   │   ├── views.py                # Analytics API views
│   │   ├── urls.py
│   │   └── admin.py
│   │
│   └── core/                        # Core app (minimal)
│       └── models.py
│
├── frontend/                        # React SPA (Vite)
│   ├── package.json
│   ├── vite.config.js               # Dev proxy to Django API
│   └── src/
│       ├── api/                     # API client modules
│       │   ├── client.js            # Axios + token interceptor
│       │   ├── auth.js
│       │   ├── courses.js
│       │   ├── feedback.js
│       │   └── dashboard.js
│       ├── context/
│       │   └── AuthContext.jsx       # Auth state management
│       ├── hooks/
│       │   └── useAuth.js
│       ├── components/
│       │   ├── layout/              # AppLayout, Sidebar, TopBar
│       │   ├── ui/                  # ProtectedRoute, RoleRoute, StarRating, StatCard
│       │   └── charts/             # SentimentPieChart, RatingBarChart, TrendLineChart, KeywordCloud
│       └── pages/
│           ├── auth/                # LoginPage, RegisterPage
│           ├── student/             # StudentDashboard, FeedbackForm, FeedbackHistory
│           ├── faculty/             # FacultyDashboard, CourseAnalytics
│           ├── admin/               # AdminDashboard, CourseManagement, CourseForm
│           └── shared/              # CourseList, CourseDetail, FeedbackDetail, ProfilePage
│
├── PROJECT_PLAN.md
├── .gitignore
└── .gitattributes
```

---

## 4. DATABASE SCHEMA (Entity Design)

### CustomUser (extends Django AbstractUser)
| Field         | Type       | Notes                           |
|---------------|------------|---------------------------------|
| id            | AutoField  | PK                              |
| username      | CharField  | Unique                          |
| email         | EmailField | Unique                          |
| password      | CharField  | Hashed                          |
| role          | CharField  | choices: student/faculty/admin  |
| department    | CharField  | Optional                        |
| enrollment_no | CharField  | For students only               |
| faculty_id    | CharField  | For faculty only                |
| phone         | CharField  | Optional                        |

### Course
| Field        | Type        | Notes                    |
|--------------|-------------|--------------------------|
| id           | AutoField   | PK                       |
| name         | CharField   |                          |
| code         | CharField   | Unique (e.g., CS401)     |
| department   | CharField   |                          |
| semester     | IntegerField|                          |
| faculty      | ForeignKey  | -> CustomUser (faculty)  |
| academic_year| CharField   | e.g., 2025-26            |
| is_active    | BooleanField| Default True             |
| created_at   | DateTimeField| Auto                    |
| updated_at   | DateTimeField| Auto                    |

### Feedback
| Field            | Type         | Notes                              |
|------------------|--------------|------------------------------------|
| id               | AutoField    | PK                                 |
| student          | ForeignKey   | -> CustomUser (anonymous optional) |
| course           | ForeignKey   | -> Course                          |
| rating_teaching  | IntegerField | 1-5 Likert scale                   |
| rating_content   | IntegerField | 1-5                                |
| rating_engagement| IntegerField | 1-5                                |
| rating_overall   | IntegerField | 1-5                                |
| text_feedback    | TextField    | Free-text (for NLP analysis)       |
| is_anonymous     | BooleanField | Default True                       |
| created_at       | DateTimeField| Auto                               |
| *unique_together*| -            | (student, course)                  |

### SentimentResult
| Field           | Type         | Notes                              |
|-----------------|--------------|------------------------------------|
| id              | AutoField    | PK                                 |
| feedback        | OneToOneField| -> Feedback                        |
| polarity        | FloatField   | -1.0 to 1.0                        |
| subjectivity    | FloatField   | 0.0 to 1.0                         |
| sentiment_label | CharField    | positive/neutral/negative           |
| keywords        | JSONField    | Extracted keywords list             |
| category_scores | JSONField    | {teaching, content, engagement}     |
| processed_at    | DateTimeField| Auto                               |

---

## 5. PHASED DEVELOPMENT PLAN

### PHASE 1: Foundation & Auth (Week 1-2) --- COMPLETED
**Goal**: Project setup, user authentication, role-based access

Tasks:
- [x] Initialize Django project and `core` app
- [x] Set up `requirements.txt` with dependencies
- [x] Create `accounts` app with CustomUser model (Student/Faculty/Admin roles)
- [x] Implement registration and login with role selection
- [x] Create role-based access decorators
- [x] Build base UI layout
- [x] Create home/landing page
- [x] Set up static files structure
- [x] Write initial migrations and test user creation

**Deliverables**: Working auth system with 3 user roles

---

### PHASE 2: Architecture Migration + Course & Feedback (Week 3-4) --- COMPLETED
**Goal**: Migrate to DRF + React, implement course management and feedback

Tasks:
- [x] Configure Django REST Framework with Token Authentication
- [x] Set up CORS for React dev server
- [x] Create DRF permission classes (IsStudent, IsFaculty, IsAdminUser, IsFacultyOrAdmin)
- [x] Build auth API endpoints (register, login, logout, profile)
- [x] Create `courses` app with Course model and CourseViewSet (CRUD)
- [x] Create `feedback` app with Feedback model and FeedbackViewSet
- [x] Enforce one feedback per student per course (unique_together)
- [x] Build React frontend with Vite + Tailwind CSS
- [x] Implement auth flow (login, register, token persistence)
- [x] Create role-based routing (ProtectedRoute, RoleRoute)
- [x] Build feedback submission form with star ratings
- [x] Build feedback history page

**Deliverables**: Full DRF API backend + React SPA with auth, courses, feedback

---

### PHASE 3: AI/NLP Sentiment Analysis Engine (Week 5-6) --- COMPLETED
**Goal**: Analyze text feedback using NLP

Tasks:
- [x] Create `analysis` app with SentimentResult model
- [x] Integrate TextBlob for sentiment polarity & subjectivity scoring
- [x] Implement sentiment classification (positive/neutral/negative with thresholds)
- [x] Build keyword extraction using TextBlob noun phrases
- [x] Create category tagging logic (teaching/content/engagement)
- [x] Auto-trigger analysis on feedback submission (post_save signal)
- [x] Store results in SentimentResult model

**Deliverables**: Every submitted feedback auto-analyzed, sentiment + keywords stored

---

### PHASE 4: Dashboard & Analytics (Week 7-8) --- COMPLETED
**Goal**: Role-specific dashboards with charts and insights

Tasks:
- [x] Create dashboard stats API endpoint (role-specific)
- [x] Create course sentiment analytics API endpoint
- [x] Create department analytics API endpoint (admin)
- [x] **Student Dashboard**: Feedback count, courses, avg rating, recent feedback
- [x] **Faculty Dashboard**: Sentiment distribution pie chart, courses with analytics links
- [x] **Faculty Course Analytics**: Sentiment trend, rating breakdown, keyword cloud
- [x] **Admin Dashboard**: System stats, course comparison, department overview table
- [x] Implement Recharts components (PieChart, BarChart, LineChart, KeywordCloud)
- [x] Build admin course management page (CRUD table)

**Deliverables**: Fully functional dashboards with interactive charts per role

---

### PHASE 5: Advanced Features & Polish (Week 9-10)
**Goal**: Improve AI accuracy, add advanced features, polish UI

Tasks:
- [ ] Upgrade to HuggingFace transformers for better sentiment accuracy (optional)
- [ ] Add feedback response feature (faculty can respond to feedback)
- [ ] Implement feedback periods (open/close feedback windows)
- [ ] Add CSV/PDF export for reports
- [ ] Email notifications (optional - feedback period reminders)
- [ ] Improve UI/UX: loading states, responsive design, accessibility
- [ ] Add pagination for feedback lists
- [ ] Performance optimization (caching, query optimization)

**Deliverables**: Production-ready features, improved AI accuracy

---

### PHASE 6: Testing, Deployment & Documentation (Week 11-12)
**Goal**: Test, deploy, and document

Tasks:
- [ ] Write unit tests for models, views, and NLP functions
- [ ] Integration testing for feedback submission -> analysis pipeline
- [ ] Load testing with bulk feedback data
- [ ] Create seed data script (sample users, courses, feedback)
- [ ] Deploy to a server (PythonAnywhere / Railway / Render)
- [ ] Write user documentation / help pages
- [ ] Create project report and presentation
- [ ] Final demo preparation

**Deliverables**: Deployed system, documentation, test results

---

## 6. API ENDPOINTS

```
# Authentication
POST   /api/auth/register/              - User registration (returns token)
POST   /api/auth/login/                 - User login (returns token)
POST   /api/auth/logout/                - Logout (deletes token)
GET    /api/auth/profile/               - View profile
PUT    /api/auth/profile/               - Update profile

# Courses (DRF ViewSet)
GET    /api/courses/                    - List courses (role-filtered)
POST   /api/courses/                    - Create course (admin only)
GET    /api/courses/<id>/               - Course detail
PUT    /api/courses/<id>/               - Update course (admin only)
DELETE /api/courses/<id>/               - Delete course (admin only)

# Feedback (DRF ViewSet)
POST   /api/feedback/                   - Submit feedback (student only)
GET    /api/feedback/                   - List feedback (role-filtered)
GET    /api/feedback/<id>/              - Feedback detail
DELETE /api/feedback/<id>/              - Delete feedback (admin only)

# Analytics
GET    /api/dashboard/stats/            - Role-specific dashboard stats
GET    /api/analysis/course/<id>/       - Course sentiment + ratings + trends
GET    /api/analysis/department/        - Department-wide analytics (admin only)

# Django Admin
GET    /admin/                          - Django admin panel
```

---

## 7. KEY DESIGN DECISIONS

1. **Anonymity**: Feedback is anonymous by default. The student FK exists for "one feedback per student" enforcement but is not exposed to faculty.

2. **Real-time vs Batch Analysis**: Sentiment analysis runs synchronously on submit via post_save signal (TextBlob is fast enough). For HuggingFace models, consider async processing with Celery.

3. **Rating + Text**: Both structured (Likert 1-5) and unstructured (free text) feedback are collected. Ratings give quick quantitative metrics; text gives qualitative NLP insights.

4. **Role Hierarchy**: Admin > Faculty > Student. Each role sees only relevant data. Faculty cannot see other faculty's feedback. Admin sees everything.

5. **API-First Architecture**: Django serves only as an API backend (DRF). The React SPA handles all UI rendering. This separation allows independent development of frontend and backend.

6. **Token Auth over JWT**: DRF's built-in TokenAuthentication is simpler and supports server-side revocation (just delete the token row). JWT can be adopted later if stateless auth is needed.

7. **Feedback Periods**: Initially open-ended. Phase 5 adds formal feedback windows that admin can open/close per course.

---

## 8. DEPENDENCIES

### Backend (smartClassroom/requirements.txt)
```
Django>=5.2
djangorestframework>=3.14
django-cors-headers>=4.3
textblob>=0.17.1
nltk>=3.8
python-dotenv>=1.0
```

### Frontend (frontend/package.json)
```
react, react-dom, react-router-dom
axios
recharts
react-hot-toast
lucide-react
tailwindcss
```

---

## 9. GETTING STARTED

### Backend
```bash
cd smartClassroom
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Create an admin user
python manage.py runserver        # Starts on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                       # Starts on http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to Django on port 8000.
