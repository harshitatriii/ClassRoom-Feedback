# Database Structure & Documentation
## Smart Classroom Feedback & Quality Monitoring System

---

## 1. Overview

The project uses **SQLite** as its database engine (file: `smartClassroom/db.sqlite3`). Django's ORM manages all tables, relationships, and migrations automatically. The database can be switched to PostgreSQL or MySQL with a simple config change in `settings.py`.

**To browse the database**: Open `smartClassroom/db.sqlite3` in **DB Browser for SQLite**.

---

## 2. Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    School     │──1:N──│   Program    │──1:N──│   Subject    │
│              │       │              │       │              │
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ name         │       │ name         │       │ name         │
│ code (unique)│       │ code (unique)│       │ code (unique)│
│ is_active    │       │ school (FK)  │       │ program (FK) │
│ created_at   │       │ total_sems   │       │ semester     │
└──────────────┘       │ is_active    │       │ faculty (FK)─┼──→ CustomUser
                       └──────────────┘       │ academic_year│
                                              │ is_active    │
                                              └──────┬───────┘
                                                     │
                       ┌──────────────┐              │ 1:N
                       │ CustomUser   │              │
                       │              │       ┌──────┴───────┐
                       │ id (PK)      │──1:N──│  Feedback    │
                       │ username     │       │              │
                       │ role         │       │ id (PK)      │
                       │ school (FK)  │       │ student (FK) │
                       │ program (FK) │       │ subject (FK) │
                       │ semester     │       │ ratings (x4) │
                       │ enrollment_no│       │ text_feedback│
                       └──────────────┘       │ is_anonymous │
                                              └──────┬───────┘
                                                     │ 1:1
                                              ┌──────┴───────┐
                                              │ Sentiment    │
                                              │ Result       │
                                              │              │
                                              │ id (PK)      │
                                              │ feedback (FK)│
                                              │ polarity     │
                                              │ subjectivity │
                                              │ sentiment    │
                                              │ keywords     │
                                              │ aspect_sent. │
                                              │ emotions     │
                                              └──────────────┘

┌──────────────┐              ┌──────────────┐
│ LiveSession  │──1:N────────│  LivePulse   │
│              │              │              │
│ id (PK)      │              │ id (PK)      │
│ faculty (FK) │              │ session (FK) │
│ subject (FK) │              │ student (FK) │
│ session_code │              │ reaction     │
│ is_active    │              │ created_at   │
│ started_at   │              └──────────────┘
│ ended_at     │
└──────────────┘
```

**Relationships summary**:
- School → Program → Subject (university hierarchy)
- CustomUser → Feedback → SentimentResult (feedback pipeline)
- Subject ← Faculty (CustomUser with role='faculty')
- LiveSession → LivePulse (live classroom reactions)
- LiveSession ← Faculty, Subject

---

## 3. Table Details

### 3.1 `accounts_customuser` — Users

Extends Django's built-in User model. Stores all users — students, faculty, and admins.

| Column           | Type         | Description                                    |
|------------------|-------------|------------------------------------------------|
| id               | INTEGER (PK) | Auto-increment primary key                    |
| username         | VARCHAR      | Unique login identifier                       |
| email            | VARCHAR      | Unique email address                          |
| password         | VARCHAR      | Hashed password (Django handles hashing)      |
| first_name       | VARCHAR      | User's first name                             |
| last_name        | VARCHAR      | User's last name                              |
| role             | VARCHAR(10)  | `student`, `faculty`, or `admin`              |
| school_id        | INTEGER (FK) | Links to `courses_school` (nullable)          |
| program_id       | INTEGER (FK) | Links to `courses_program` (students only)    |
| current_semester | INTEGER      | Student's current semester (nullable)         |
| enrollment_no    | VARCHAR(20)  | Student enrollment number                     |
| faculty_id       | VARCHAR(20)  | Faculty identification number                 |
| phone            | VARCHAR(15)  | Contact phone (optional)                      |
| is_active        | BOOLEAN      | Account active status                         |
| date_joined      | DATETIME     | Registration timestamp                        |

**Key queries:**
```sql
-- All students in BTech Semester 8
SELECT username, first_name, last_name, enrollment_no
FROM accounts_customuser
WHERE role = 'student' AND current_semester = 8;

-- All faculty members
SELECT username, first_name, last_name, faculty_id
FROM accounts_customuser
WHERE role = 'faculty';
```

---

### 3.2 `courses_school` — Schools

Top-level organizational unit (e.g., School of Engineering & Technology).

| Column      | Type         | Description                |
|-------------|-------------|----------------------------|
| id          | INTEGER (PK) | Auto-increment primary key |
| name        | VARCHAR(200) | Full school name           |
| code        | VARCHAR(10)  | Unique short code (e.g., SOET) |
| description | TEXT         | Optional description       |
| is_active   | BOOLEAN      | Active status              |
| created_at  | DATETIME     | Creation timestamp         |

---

### 3.3 `courses_program` — Programs

Degree programs within a school (e.g., B.Tech, M.Tech, BCA).

| Column          | Type         | Description                        |
|-----------------|-------------|------------------------------------|
| id              | INTEGER (PK) | Auto-increment primary key        |
| name            | VARCHAR(200) | Full program name                 |
| code            | VARCHAR(20)  | Unique short code (e.g., BTECH)   |
| school_id       | INTEGER (FK) | Links to `courses_school`         |
| total_semesters | INTEGER      | Total semesters in program (e.g., 8) |
| is_active       | BOOLEAN      | Active status                     |
| created_at      | DATETIME     | Creation timestamp                |

---

### 3.4 `courses_subject` — Subjects

Individual subjects/courses taught in a program's semester.

| Column        | Type         | Description                          |
|---------------|-------------|--------------------------------------|
| id            | INTEGER (PK) | Auto-increment primary key          |
| name          | VARCHAR(200) | Subject name (e.g., Data Structures)|
| code          | VARCHAR(20)  | Unique code (e.g., CS301)           |
| program_id    | INTEGER (FK) | Links to `courses_program`          |
| semester      | INTEGER      | Which semester this subject is in   |
| faculty_id    | INTEGER (FK) | Links to `accounts_customuser` (faculty) |
| academic_year | VARCHAR(10)  | e.g., 2025-26                       |
| is_active     | BOOLEAN      | Active status                       |
| created_at    | DATETIME     | Creation timestamp                  |
| updated_at    | DATETIME     | Last update timestamp               |

**Key queries:**
```sql
-- All subjects for BTech Semester 8
SELECT s.code, s.name, u.first_name || ' ' || u.last_name AS faculty
FROM courses_subject s
JOIN courses_program p ON s.program_id = p.id
JOIN accounts_customuser u ON s.faculty_id = u.id
WHERE p.code = 'BTECH' AND s.semester = 8 AND s.is_active = 1;
```

---

### 3.5 `feedback_feedback` — Student Feedback

Stores each feedback submission with 4 Likert-scale ratings and optional free text.

| Column            | Type         | Description                           |
|-------------------|-------------|---------------------------------------|
| id                | INTEGER (PK) | Auto-increment primary key           |
| student_id        | INTEGER (FK) | Links to `accounts_customuser`       |
| subject_id        | INTEGER (FK) | Links to `courses_subject`           |
| rating_teaching   | INTEGER      | Teaching quality (1-5)               |
| rating_content    | INTEGER      | Content quality (1-5)                |
| rating_engagement | INTEGER      | Engagement level (1-5)               |
| rating_overall    | INTEGER      | Overall rating (1-5)                 |
| text_feedback     | TEXT         | Free-text feedback (used by NLP)     |
| is_anonymous      | BOOLEAN      | Whether feedback is anonymous        |
| created_at        | DATETIME     | Submission timestamp                 |

**Constraint**: `UNIQUE(student_id, subject_id)` — one feedback per student per subject.

**Key queries:**
```sql
-- All feedback for a specific subject
SELECT u.username, f.rating_overall, f.text_feedback, f.created_at
FROM feedback_feedback f
JOIN accounts_customuser u ON f.student_id = u.id
WHERE f.subject_id = 1;

-- Average ratings across all subjects
SELECT s.code, s.name,
       ROUND(AVG(f.rating_teaching), 2) AS avg_teaching,
       ROUND(AVG(f.rating_overall), 2) AS avg_overall,
       COUNT(f.id) AS total_feedback
FROM feedback_feedback f
JOIN courses_subject s ON f.subject_id = s.id
GROUP BY s.id;
```

---

### 3.6 `analysis_sentimentresult` — NLP Sentiment Analysis

Auto-generated when feedback is submitted (via Django post_save signal). One-to-one with Feedback. Now includes aspect-based sentiment and emotion detection results.

| Column            | Type         | Description                                    |
|-------------------|-------------|------------------------------------------------|
| id                | INTEGER (PK) | Auto-increment primary key                    |
| feedback_id       | INTEGER (FK) | Links to `feedback_feedback` (one-to-one)     |
| polarity          | FLOAT        | Sentiment score: -1.0 (negative) to +1.0 (positive) |
| subjectivity      | FLOAT        | How subjective: 0.0 (factual) to 1.0 (opinion) |
| sentiment_label   | VARCHAR(10)  | `positive`, `neutral`, or `negative`          |
| keywords          | JSON         | Extracted keywords list, e.g., `["teaching", "content"]` |
| category_scores   | JSON         | Category breakdown, e.g., `{"teaching": 0.6, "content": 0.3}` |
| aspect_sentiments | JSON         | **ABSA results.** Per-aspect sentiment, e.g., `{"teaching_quality": {"label": "Teaching Quality", "polarity": 0.45, "sentiment": "positive", "phrase_count": 2, "sample_phrases": ["explains well"]}, "assessment": {"polarity": -0.3, "sentiment": "negative", ...}}` |
| emotions          | JSON         | **Emotion scores.** Normalized 0.0-1.0, e.g., `{"appreciation": 1.0, "frustration": 0.0, "confusion": 0.25, "boredom": 0.0, "enthusiasm": 0.5, "satisfaction": 0.75}` |
| processed_at      | DATETIME     | When NLP analysis was performed               |

**Key queries:**
```sql
-- Sentiment distribution for a subject
SELECT sr.sentiment_label, COUNT(*) AS count
FROM analysis_sentimentresult sr
JOIN feedback_feedback f ON sr.feedback_id = f.id
WHERE f.subject_id = 1
GROUP BY sr.sentiment_label;

-- Average polarity per subject (which subjects have happiest students?)
SELECT s.code, s.name,
       ROUND(AVG(sr.polarity), 3) AS avg_polarity,
       COUNT(sr.id) AS analyzed_count
FROM analysis_sentimentresult sr
JOIN feedback_feedback f ON sr.feedback_id = f.id
JOIN courses_subject s ON f.subject_id = s.id
GROUP BY s.id
ORDER BY avg_polarity DESC;

-- Feedback with negative sentiment (for faculty review)
SELECT f.text_feedback, sr.polarity, sr.keywords, s.name AS subject
FROM analysis_sentimentresult sr
JOIN feedback_feedback f ON sr.feedback_id = f.id
JOIN courses_subject s ON f.subject_id = s.id
WHERE sr.sentiment_label = 'negative'
ORDER BY sr.polarity ASC;
```

---

### 3.7 `livefeedback_livesession` — Live Class Sessions

Tracks real-time feedback sessions where faculty invite students to send reactions during class.

| Column        | Type         | Description                              |
|---------------|-------------|------------------------------------------|
| id            | INTEGER (PK) | Auto-increment primary key              |
| faculty_id    | INTEGER (FK) | Links to `accounts_customuser` (faculty)|
| subject_id    | INTEGER (FK) | Links to `courses_subject`              |
| session_code  | VARCHAR(6)   | Unique 6-char alphanumeric code (e.g., ABC123) |
| is_active     | BOOLEAN      | Whether session is currently live        |
| started_at    | DATETIME     | When session was started                 |
| ended_at      | DATETIME     | When session was ended (nullable)        |

**Key queries:**
```sql
-- Active session for a faculty member
SELECT session_code, s.name AS subject, started_at
FROM livefeedback_livesession ls
JOIN courses_subject s ON ls.subject_id = s.id
WHERE ls.faculty_id = 1 AND ls.is_active = 1;
```

---

### 3.8 `livefeedback_livepulse` — Student Reactions

Individual real-time reactions from students during a live session.

| Column      | Type         | Description                              |
|-------------|-------------|------------------------------------------|
| id          | INTEGER (PK) | Auto-increment primary key              |
| session_id  | INTEGER (FK) | Links to `livefeedback_livesession`     |
| student_id  | INTEGER (FK) | Links to `accounts_customuser` (nullable)|
| reaction    | VARCHAR(20)  | One of: `too_fast`, `too_slow`, `confused`, `got_it`, `interesting`, `boring` |
| created_at  | DATETIME     | When reaction was sent                   |

**Key queries:**
```sql
-- Reaction distribution for a session
SELECT reaction, COUNT(*) AS count
FROM livefeedback_livepulse
WHERE session_id = 1
GROUP BY reaction;

-- Unique student count in a session
SELECT COUNT(DISTINCT student_id) AS active_students
FROM livefeedback_livepulse
WHERE session_id = 1;

-- Reactions over time (30-second buckets)
SELECT
    CAST((strftime('%s', created_at) - strftime('%s', (SELECT started_at FROM livefeedback_livesession WHERE id = 1))) / 30 AS INTEGER) AS bucket,
    reaction,
    COUNT(*) AS count
FROM livefeedback_livepulse
WHERE session_id = 1
GROUP BY bucket, reaction
ORDER BY bucket;
```

---

## 4. Data Flow: Feedback Submission Pipeline

```
Student clicks "Submit Feedback" in React UI
        │
        ▼
POST /api/feedback/  (with ratings + text)
        │
        ▼
Django validates & saves to  ──→  feedback_feedback  table
        │
        ▼
post_save signal fires automatically
        │
        ▼
NLP engine runs full_analysis() on text_feedback:
  ├── Calculates polarity (-1 to +1) and subjectivity (0 to 1)
  ├── Assigns sentiment label (positive/neutral/negative)
  ├── Extracts keywords (noun phrases)
  ├── Scores categories (teaching/content/engagement)
  ├── Aspect-Based Sentiment Analysis (ABSA):
  │   └── Splits into sentences → maps to aspects → per-aspect polarity
  └── Emotion Detection:
      └── Keyword lexicon → scores for 6 emotions (appreciation, frustration, etc.)
        │
        ▼
Results saved to  ──→  analysis_sentimentresult  table
  (polarity, subjectivity, keywords, category_scores,
   aspect_sentiments, emotions)
        │
        ▼
Dashboard APIs aggregate data from both tables
for charts, stats, and analytics views
```

### Live Feedback Flow

```
Faculty clicks "Go Live" in React UI
        │
        ▼
POST /api/live/start/  (with subject_id)
        │
        ▼
LiveSession created with auto-generated 6-char code
        │
        ▼
Students enter code in "Live Feedback" page
POST /api/live/join/  (with session_code)
        │
        ▼
Students tap reaction buttons
POST /api/live/pulse/  (with session + reaction)
  └── Rate-limited: 1 per 5 seconds per student
        │
        ▼
LivePulse records saved to  ──→  livefeedback_livepulse  table
        │
        ▼
Faculty dashboard polls GET /api/live/dashboard/<id>/  every 3 seconds
  Returns: reaction_counts, timeline, recent_pulses, student_count
```

---

## 5. Auth Token Table

### `authtoken_token` — API Authentication Tokens

| Column   | Type         | Description                        |
|----------|--------------|------------------------------------|
| key      | VARCHAR (PK) | 40-character token string          |
| user_id  | INTEGER (FK) | Links to `accounts_customuser`     |
| created  | DATETIME     | When token was created             |

Each user gets one token on login. The React frontend sends this token in every API request as `Authorization: Token <key>`. On logout, the token is deleted.

---

## 6. Switching to PostgreSQL or MySQL (Future)

The database can be switched by updating `smartClassroom/settings.py`:

```python
# PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'smartclassroom',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# MySQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'smartclassroom',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

Then run:
```bash
pip install psycopg2    # for PostgreSQL
pip install mysqlclient  # for MySQL
python manage.py migrate
python seed_data.py      # re-populate sample data
```

All queries and ORM code remain unchanged — Django handles the translation.
