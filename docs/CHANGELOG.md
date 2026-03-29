# Changelog

## Novelty Features: ABSA, Emotion Detection & Real-Time Live Feedback

**Date**: March 2026
**Scope**: Full-stack — new NLP features, new Django app, new React pages & chart components

### Summary

Added three research-level features that differentiate this project from typical feedback systems: (1) **Aspect-Based Sentiment Analysis** that breaks down sentiment per aspect, (2) **Emotion Detection** that classifies feedback into 6 emotions beyond positive/negative, and (3) **Real-Time Live Feedback** where students send reactions during class and faculty sees a live dashboard.

### What Changed

#### 1. Aspect-Based Sentiment Analysis (ABSA)

Instead of just overall sentiment, feedback is now analyzed per aspect:
- **Teaching Quality** — teaching style, explanation clarity, lecture delivery
- **Content Quality** — syllabus, materials, depth, relevance
- **Engagement** — interactivity, discussions, participation
- **Assessment & Fairness** — exams, grading, difficulty

**Example**: "The professor explains well but the exams are too tough"
→ Teaching Quality: **Positive** (+0.45) | Assessment: **Negative** (-0.30)

**Implementation**: Splits text into sentences using TextBlob, maps each sentence to aspects via keyword dictionaries, computes per-aspect sentiment independently. Results stored in `aspect_sentiments` JSONField on SentimentResult.

#### 2. Emotion Detection

Feedback is classified into 6 emotions with intensity scores (0.0-1.0):
- Appreciation, Frustration, Confusion, Boredom, Enthusiasm, Satisfaction

**Implementation**: Keyword-based emotion lexicon with partial stem matching (e.g., "frustrat" matches "frustrated", "frustrating"). Lightweight — no GPU/transformer model needed. Results stored in `emotions` JSONField on SentimentResult.

**Frontend**: Recharts radar chart + emoji-based emotion tiles on Course Analytics page.

#### 3. Real-Time Live Feedback During Class

A new system for in-class interaction:
- Faculty creates a **live session** → gets a unique 6-character code (e.g., "ABC123")
- Students enter the code to **join the session**
- Students tap **reaction buttons**: Too Fast, Too Slow, Confused, Got It, Interesting, Boring
- Faculty sees a **real-time dashboard** with:
  - Reaction distribution bar chart
  - Animated progress bars per reaction type
  - Dominant mood indicator + class pulse health signal
  - Timeline area chart (30-second buckets)
  - Recent reaction stream
- Rate-limited: 1 reaction per 5 seconds per student
- Dashboard polls every 3 seconds

### New Files Created

**Backend (8 files)**:
- `livefeedback/__init__.py`, `apps.py`, `models.py` — LiveSession + LivePulse models
- `livefeedback/views.py` — 7 API views (start, end, active, join, pulse, dashboard, history)
- `livefeedback/serializers.py`, `urls.py`, `admin.py`
- `livefeedback/migrations/0001_initial.py`

**Frontend (4 files)**:
- `src/api/live.js` — Live feedback API client
- `src/components/charts/AspectSentimentChart.jsx` — ABSA stacked bar chart + polarity cards
- `src/components/charts/EmotionChart.jsx` — Emotion radar chart + emoji tiles
- `src/pages/faculty/LiveSession.jsx` — Faculty live dashboard
- `src/pages/student/LivePulse.jsx` — Student reaction page

### Files Modified

**Backend (5 files)**:
- `analysis/sentiment.py` — Added `analyze_aspects()`, `detect_emotions()`, `full_analysis()`
- `analysis/models.py` — Added `aspect_sentiments` and `emotions` JSONFields
- `analysis/views.py` — Added ABSA/emotion aggregation to SubjectSentimentView and DashboardStatsView
- `analysis/serializers.py` — Added `dominant_emotion` computed field
- `feedback/signals.py` — Now calls `full_analysis()` instead of `analyze_sentiment()`

**Frontend (3 files)**:
- `src/pages/faculty/CourseAnalytics.jsx` — Added ABSA + Emotion chart sections
- `src/components/layout/Sidebar.jsx` — Added "Live Session" (faculty) and "Live Feedback" (student) nav links
- `src/App.jsx` — Added routes for `/faculty/live` and `/student/live`

**Config (2 files)**:
- `smartClassroom/settings.py` — Added `livefeedback` to INSTALLED_APPS
- `smartClassroom/urls.py` — Added `livefeedback.urls` include

### New API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/live/start/` | POST | Faculty starts a live session |
| `/api/live/end/<id>/` | POST | Faculty ends a live session |
| `/api/live/active/` | GET | Get current active session |
| `/api/live/join/` | POST | Student joins by session code |
| `/api/live/pulse/` | POST | Student sends a reaction |
| `/api/live/dashboard/<id>/` | GET | Real-time dashboard data |
| `/api/live/history/` | GET | Past session history |

### Database Changes

- `analysis_sentimentresult`: Added `aspect_sentiments` (JSON) and `emotions` (JSON) columns
- New table: `livefeedback_livesession` (faculty, subject, session_code, is_active, timestamps)
- New table: `livefeedback_livepulse` (session, student, reaction, created_at)

---

## University Hierarchy Restructuring

**Date**: March 2026
**Scope**: Full-stack data model refactor (backend + frontend)

### Summary

Replaced the flat `Course` model with a proper university hierarchy: **School → Program → Subject**. Students now belong to a specific school, program, and semester, and only see subjects relevant to their enrollment. Faculty is assigned to a school and teaches specific subjects.

### What Changed

#### New Data Model

```
School (SOET, SOMS, ...)
  └── Program (B.Tech, BCA, BBA, ...)
        └── Subject (Data Structures, Machine Learning, ...)
              └── Feedback (per student per subject)
```

- **School**: Top-level organizational unit (e.g., School of Engineering & Technology). Fields: `name`, `code`, `is_active`.
- **Program**: Degree program belonging to a school (e.g., B.Tech under SOET). Fields: `name`, `code`, `school` FK, `total_semesters`.
- **Subject**: Individual course/subject in a program's semester (replaces old `Course` model). Fields: `name`, `code`, `program` FK, `semester`, `faculty` FK, `academic_year`.

#### User Model Changes

| Old Field    | New Fields                              |
|--------------|-----------------------------------------|
| `department` | `school` (FK), `program` (FK), `current_semester` (int) |

- **Students**: Assigned to a school + program + current semester
- **Faculty**: Assigned to a school (teaches subjects across programs)
- **Admin**: No school/program required

#### API Endpoints

| Old Endpoint               | New Endpoint                |
|----------------------------|-----------------------------|
| `GET/POST /api/courses/`   | `GET/POST /api/subjects/`   |
| `GET /api/analysis/course/<id>/` | `GET /api/analysis/subject/<id>/` |
| `GET /api/analysis/department/`  | `GET /api/analysis/school/`       |
| —                          | `GET/POST /api/schools/` (new)    |
| —                          | `GET/POST /api/programs/` (new)   |

#### Role-Based Filtering

- **Students** calling `GET /api/subjects/` automatically receive only subjects matching their `program` + `current_semester`
- **Faculty** see only subjects they are assigned to teach
- **Admin** sees all subjects with optional filters (`?school=`, `?program=`, `?semester=`)

#### Frontend Changes

- **Registration**: Cascading dropdowns — select School → Program populates → Semester range auto-calculated from `program.total_semesters`
- **Sidebar**: Labels updated from "Courses" to "Subjects"
- **Admin Dashboard**: Analytics grouped by school/program instead of department
- **Subject Management**: Admin CRUD with school/program cascading selectors
- **Profile Page**: Read-only display of school, program, and semester info

### Files Modified

**Backend (15 files)**:
- `courses/models.py` — School, Program, Subject models
- `accounts/models.py` — school/program/current_semester FKs
- `feedback/models.py` — course → subject FK
- `courses/serializers.py`, `accounts/serializers.py`, `feedback/serializers.py`
- `courses/views.py` — SchoolViewSet, ProgramViewSet, SubjectViewSet
- `courses/urls.py`, `analysis/urls.py`
- `feedback/views.py`, `analysis/views.py`
- `courses/admin.py`, `accounts/admin.py`, `feedback/admin.py`
- `seed_data.py` — complete rewrite with hierarchy data

**Frontend (17 files)**:
- `api/courses.js`, `api/dashboard.js` — new API functions
- All page components updated (course → subject references)
- `RegisterPage.jsx` — cascading dropdown registration
- `Sidebar.jsx`, `App.jsx` — route and label updates

### Seed Data

The `seed_data.py` script creates:
- 2 schools (SOET, SOMS)
- 3 programs (B.Tech/8 semesters, BCA/6 semesters, BBA/6 semesters)
- 3 faculty users, 5 student users, 1 admin
- 5 subjects across B.Tech semesters
- 13 feedback entries with auto-generated sentiment analysis
