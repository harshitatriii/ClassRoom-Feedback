# Smart Classroom Feedback & Quality Monitoring System
## Project Plan, HLD & Phased Development Guide

---

## 1. HIGH-LEVEL DESIGN (HLD)

### 1.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Browser)                       │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │ Student   │  │ Faculty      │  │ Admin Dashboard           │ │
│  │ Feedback  │  │ View Reports │  │ Analytics + Trends +      │ │
│  │ Forms     │  │ + Sentiment  │  │ Sentiment Scores + Charts │ │
│  └──────────┘  └──────────────┘  └───────────────────────────┘ │
│         HTML/CSS/JS + Chart.js/Plotly                           │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP (Django Templates / REST API)
┌────────────────────────▼────────────────────────────────────────┐
│                    BACKEND (Django)                              │
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
│              │ (TextBlob/NLTK/   │                              │
│              │  HuggingFace)     │                              │
│              │ - Sentiment Score │                              │
│              │ - Keyword Extract │                              │
│              │ - Topic Classify  │                              │
│              └───────────────────┘                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    DATABASE (MongoDB)                            │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Users    │ │ Feedback  │ │ Courses  │ │ Sentiment        │ │
│  │Collection│ │Collection │ │Collection│ │Results Collection│ │
│  └──────────┘ └───────────┘ └──────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Module Breakdown

| Module               | Responsibility                                             |
|----------------------|------------------------------------------------------------|
| **Auth Module**      | Registration, login, role-based access (Student/Faculty/Admin) |
| **Feedback Module**  | Submit, view, edit feedback (structured + free-text)        |
| **NLP/AI Module**    | Sentiment analysis, keyword extraction, topic classification |
| **Analytics Module** | Aggregate scores, trend charts, comparative reports         |
| **Dashboard Module** | Role-specific views, charts (Chart.js/Plotly), export       |
| **Admin Module**     | User management, course/subject CRUD, system config         |

### 1.3 Data Flow

```
Student submits feedback
        │
        ▼
  Feedback stored in DB (raw)
        │
        ▼
  NLP Engine processes text
  ├── Sentiment score (positive/neutral/negative + polarity)
  ├── Keyword extraction (top topics mentioned)
  └── Category tagging (teaching/content/engagement/infrastructure)
        │
        ▼
  Results stored in DB (processed)
        │
        ▼
  Dashboard aggregates & visualizes
  ├── Faculty sees: own course sentiment trends
  ├── Admin sees: department-wide analytics, comparisons
  └── Student sees: confirmation + anonymous aggregate
```

---

## 2. TECHNOLOGY DECISIONS

| Layer         | Choice              | Rationale                                    |
|---------------|---------------------|----------------------------------------------|
| Backend       | Django 4.x          | Robust, built-in auth, admin panel, ORM      |
| Database      | MongoDB (djongo)    | Flexible schema for varied feedback formats   |
| NLP - Basic   | TextBlob            | Simple, fast sentiment for MVP                |
| NLP - Advanced| NLTK + HuggingFace  | Better accuracy for later phases              |
| Frontend      | Django Templates    | Server-rendered, simpler than SPA for MVP     |
| Charts        | Chart.js + Plotly   | Interactive, publication-quality charts        |
| CSS Framework | Bootstrap 5         | Responsive, fast to build professional UI     |

**Note on MongoDB**: Since Django's native ORM doesn't support MongoDB directly, we have two practical options:
- **Option A (Recommended for simplicity)**: Use **SQLite/PostgreSQL** with Django ORM for the MVP, switch to MongoDB later if needed.
- **Option B**: Use **djongo** or **pymongo** directly for MongoDB integration.

The plan below assumes **Option A** (SQLite for dev, PostgreSQL for production) for faster development, but the models are designed to be easily migrated.

---

## 3. PROJECT STRUCTURE (Target)

```
ClassRoom-Feedback/
├── smartClassroom/                  # Django project root
│   ├── manage.py
│   ├── requirements.txt
│   ├── smartClassroom/              # Project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── accounts/                    # App: Authentication & User Management
│   │   ├── models.py               # CustomUser (Student/Faculty/Admin roles)
│   │   ├── views.py                # Login, Register, Profile
│   │   ├── forms.py                # Registration/Login forms
│   │   ├── urls.py
│   │   ├── decorators.py           # Role-based access decorators
│   │   └── templates/accounts/
│   │       ├── login.html
│   │       ├── register.html
│   │       └── profile.html
│   │
│   ├── courses/                     # App: Course & Subject Management
│   │   ├── models.py               # Course, Subject, Enrollment
│   │   ├── views.py                # CRUD for courses
│   │   ├── urls.py
│   │   └── templates/courses/
│   │       ├── course_list.html
│   │       └── course_detail.html
│   │
│   ├── feedback/                    # App: Feedback Collection
│   │   ├── models.py               # Feedback, FeedbackQuestion
│   │   ├── views.py                # Submit, List, Detail
│   │   ├── forms.py                # Feedback submission forms
│   │   ├── urls.py
│   │   └── templates/feedback/
│   │       ├── submit.html
│   │       ├── my_feedback.html
│   │       └── feedback_detail.html
│   │
│   ├── analysis/                    # App: NLP/AI Sentiment Engine
│   │   ├── sentiment.py            # TextBlob/NLTK sentiment analysis
│   │   ├── keywords.py             # Keyword/topic extraction
│   │   ├── models.py               # SentimentResult, AnalysisCache
│   │   ├── tasks.py                # Background processing (optional)
│   │   └── utils.py                # Text preprocessing utilities
│   │
│   ├── dashboard/                   # App: Analytics Dashboard
│   │   ├── views.py                # Dashboard views per role
│   │   ├── urls.py
│   │   ├── charts.py               # Chart data preparation
│   │   └── templates/dashboard/
│   │       ├── student_dashboard.html
│   │       ├── faculty_dashboard.html
│   │       └── admin_dashboard.html
│   │
│   ├── static/                      # Static assets
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── js/
│   │   │   ├── charts.js
│   │   │   └── feedback.js
│   │   └── images/
│   │
│   └── templates/                   # Global templates
│       ├── base.html                # Base layout with navbar
│       ├── home.html
│       └── components/
│           ├── navbar.html
│           └── footer.html
│
├── PROJECT_PLAN.md                  # This file
├── venv/                            # Virtual environment
└── .gitignore
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

### Course
| Field       | Type        | Notes                    |
|-------------|-------------|--------------------------|
| id          | AutoField   | PK                       |
| name        | CharField   |                          |
| code        | CharField   | Unique (e.g., CS401)     |
| department  | CharField   |                          |
| semester    | IntegerField|                          |
| faculty     | ForeignKey  | -> CustomUser (faculty)  |
| academic_year| CharField  | e.g., 2025-26            |
| is_active   | BooleanField| Default True             |

### Feedback
| Field           | Type         | Notes                              |
|-----------------|--------------|------------------------------------|
| id              | AutoField    | PK                                 |
| student         | ForeignKey   | -> CustomUser (anonymous optional) |
| course          | ForeignKey   | -> Course                          |
| rating_teaching | IntegerField | 1-5 Likert scale                   |
| rating_content  | IntegerField | 1-5                                |
| rating_engagement| IntegerField| 1-5                                |
| rating_overall  | IntegerField | 1-5                                |
| text_feedback   | TextField    | Free-text (for NLP analysis)       |
| is_anonymous    | BooleanField | Default True                       |
| created_at      | DateTimeField| Auto                               |

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

### PHASE 1: Foundation & Auth (Week 1-2)
**Goal**: Project setup, user authentication, role-based access

Tasks:
- [x] Initialize Django project and `core` app
- [ ] Set up `requirements.txt` with dependencies
- [ ] Create `accounts` app with CustomUser model (Student/Faculty/Admin roles)
- [ ] Implement registration and login views with role selection
- [ ] Create role-based access decorators (`@student_required`, `@faculty_required`, `@admin_required`)
- [ ] Build base template (`base.html`) with Bootstrap 5 navbar
- [ ] Create home/landing page
- [ ] Set up static files structure (CSS/JS)
- [ ] Write initial migrations and test user creation

**Deliverables**: Working auth system with 3 user roles, base UI layout

---

### PHASE 2: Course Management & Feedback Submission (Week 3-4)
**Goal**: Course CRUD and feedback collection forms

Tasks:
- [ ] Create `courses` app with Course model
- [ ] Admin can create/edit/delete courses and assign faculty
- [ ] Students can view enrolled courses
- [ ] Create `feedback` app with Feedback model
- [ ] Build feedback submission form (Likert ratings + free-text)
- [ ] Enforce one feedback per student per course per period
- [ ] Students can view their submitted feedback history
- [ ] Faculty can see feedback count (not content yet)
- [ ] Add form validation and success/error messages

**Deliverables**: Students can submit structured + text feedback for courses

---

### PHASE 3: AI/NLP Sentiment Analysis Engine (Week 5-6)
**Goal**: Analyze text feedback using NLP

Tasks:
- [ ] Create `analysis` app
- [ ] Implement text preprocessing (lowercase, stopword removal, cleaning)
- [ ] Integrate TextBlob for sentiment polarity & subjectivity scoring
- [ ] Implement sentiment classification (positive/neutral/negative with thresholds)
- [ ] Build keyword extraction using NLTK (TF-IDF or frequency-based)
- [ ] Create category tagging logic (teaching/content/engagement)
- [ ] Auto-trigger analysis on feedback submission (signal/post_save)
- [ ] Store results in SentimentResult model
- [ ] Test with sample feedback data

**Deliverables**: Every submitted feedback auto-analyzed, sentiment + keywords stored

---

### PHASE 4: Dashboard & Analytics (Week 7-8)
**Goal**: Role-specific dashboards with charts and insights

Tasks:
- [ ] Create `dashboard` app
- [ ] **Student Dashboard**: View own feedback history, see aggregate sentiment for courses
- [ ] **Faculty Dashboard**:
  - Sentiment trend over time (line chart - Chart.js)
  - Average ratings breakdown (bar chart)
  - Word cloud of frequent keywords
  - Top positive/negative feedback snippets
- [ ] **Admin Dashboard**:
  - Department-wide sentiment overview (heatmap/table)
  - Faculty comparison charts
  - Course-wise sentiment trends
  - Overall system statistics (total feedback, avg sentiment)
- [ ] Implement date range filtering for analytics
- [ ] Add Chart.js and/or Plotly integration
- [ ] Create reusable chart components

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

## 6. API ENDPOINTS (URL Structure)

```
# Authentication
/accounts/register/          POST   - User registration
/accounts/login/             POST   - User login
/accounts/logout/            GET    - Logout
/accounts/profile/           GET    - View profile

# Courses
/courses/                    GET    - List courses
/courses/<id>/               GET    - Course detail
/courses/create/             POST   - Create course (admin)
/courses/<id>/edit/          POST   - Edit course (admin)

# Feedback
/feedback/submit/<course_id>/  GET/POST - Submit feedback
/feedback/my/                  GET      - My feedback history
/feedback/<id>/                GET      - Feedback detail

# Dashboard
/dashboard/                  GET    - Role-based dashboard redirect
/dashboard/student/          GET    - Student dashboard
/dashboard/faculty/          GET    - Faculty dashboard
/dashboard/admin/            GET    - Admin dashboard

# Analytics API (JSON for charts)
/api/sentiment/course/<id>/  GET    - Sentiment data for a course
/api/sentiment/faculty/<id>/ GET    - Sentiment data for a faculty
/api/trends/                 GET    - Overall trend data
```

---

## 7. KEY DESIGN DECISIONS

1. **Anonymity**: Feedback is anonymous by default. The student FK exists for "one feedback per student" enforcement but is not exposed to faculty.

2. **Real-time vs Batch Analysis**: Sentiment analysis runs synchronously on submit for the MVP (TextBlob is fast enough). For HuggingFace models, consider async processing with Celery.

3. **Rating + Text**: Both structured (Likert 1-5) and unstructured (free text) feedback are collected. Ratings give quick quantitative metrics; text gives qualitative NLP insights.

4. **Role Hierarchy**: Admin > Faculty > Student. Each role sees only relevant data. Faculty cannot see other faculty's feedback. Admin sees everything.

5. **Feedback Periods**: Initially open-ended. Phase 5 adds formal feedback windows that admin can open/close per course.

---

## 8. DEPENDENCIES (requirements.txt)

```
Django>=4.2
textblob>=0.17.1
nltk>=3.8
plotly>=5.18
django-crispy-forms>=2.0
crispy-bootstrap5>=0.7
Pillow>=10.0
python-dotenv>=1.0
# Phase 5 (optional)
# transformers>=4.30
# torch>=2.0
```

---

## 9. GETTING STARTED (Next Steps)

1. Install dependencies: `pip install -r requirements.txt`
2. Create the `accounts` app: `python manage.py startapp accounts`
3. Create CustomUser model and update `AUTH_USER_MODEL` in settings
4. Run migrations: `python manage.py makemigrations && python manage.py migrate`
5. Build login/register templates with Bootstrap 5
6. Proceed phase by phase as outlined above
