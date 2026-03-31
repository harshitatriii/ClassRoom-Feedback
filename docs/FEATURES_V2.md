# Features V2 — Live Interaction & Feedback Campaigns

**Date**: March 2026
**Scope**: Full-stack — 4 new features across backend (Django) and frontend (React)

---

## Feature 1: Live Questions During Live Classes

Students can ask text questions during a live session (alongside reactions). Faculty sees questions sorted by upvotes and can mark them as answered.

### What Changed

**New Models** (`livefeedback/models.py`):
- `LiveQuestion`: session FK, student FK, text, is_anonymous, is_answered, created_at
- `LiveQuestionVote`: question FK, student FK (unique_together) — one upvote per student

**New API Endpoints**:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/live/questions/` | POST | Student submits a question (session, text, is_anonymous) |
| `/api/live/questions/<session_id>/` | GET | List questions for a session (sorted by upvotes) |
| `/api/live/questions/<question_id>/upvote/` | POST | Toggle upvote on a question |
| `/api/live/questions/<question_id>/answered/` | POST | Faculty toggles answered status |

**Frontend Changes**:
- `LivePulse.jsx` (student): Added tabs — "Reactions" and "Questions". Questions tab has ask form with anonymous toggle, question list with upvote buttons, answered status badges
- `LiveSession.jsx` (faculty): Added "Live Questions" section in dashboard showing all questions sorted by votes, with "Mark Done" buttons. Polls every 5 seconds
- `api/live.js`: Added `submitQuestion`, `getQuestions`, `upvoteQuestion`, `markQuestionAnswered`

**Key Behavior**:
- Questions poll every 5 seconds (both student and faculty)
- Students can toggle anonymous per question
- Upvote is a toggle (click again to remove)
- Faculty sees upvote count + can mark as answered (toggleable)
- Answered questions get green highlight

### Database Tables
- `livefeedback_livequestion`: id, session_id, student_id, text, is_anonymous, is_answered, created_at
- `livefeedback_livequestionvote`: id, question_id, student_id, created_at (unique: question+student)

---

## Feature 2: Active & Missing Students in Live Sessions

Faculty can click the "Active Students" count to see which students are present (sent reactions), which are missing (in class roster but haven't joined), and which are outsiders (not in class roster).

### What Changed

**New API Endpoint**:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/live/students/<session_id>/` | GET | Returns active, missing, and outsider student lists |

**Response Structure**:
```json
{
  "active": [{"id": 1, "username": "...", "full_name": "...", "enrollment_no": "..."}],
  "missing": [...],
  "outsiders": [...],
  "active_count": 5,
  "missing_count": 3,
  "roster_count": 8,
  "is_class_session": true
}
```

**Roster Logic**:
- For class sessions (with subject): roster = all students with `program == subject.program` AND `current_semester == subject.semester`
- Active = students who sent at least one pulse
- Missing = roster - active
- Outsiders = active students NOT in roster (potential unauthorized joiners)
- For custom sessions (no subject): only active list is available

**Frontend Changes**:
- `LiveSession.jsx`: "Active Students" card is now a clickable button. Opens a modal with:
  - Summary cards (Present / Missing / Total Roster)
  - Outsiders warning section (amber, with AlertTriangle icon) if any unknown students detected
  - Active students list (green dots)
  - Missing students list (red dots)
  - For custom sessions: shows only active list with info message

---

## Feature 3: Non-Subject Live Sessions (Custom Events)

Faculty can now start live sessions that aren't tied to a specific subject — for hackathons, masterclasses, workshops, seminars, and other events.

### What Changed

**Model Changes** (`livefeedback/models.py` — `LiveSession`):
- `subject` FK: changed to `null=True, blank=True` (was required)
- New field `title`: CharField(max_length=200, blank=True) — custom name for non-subject sessions
- New field `session_type`: CharField with choices: `class`, `hackathon`, `masterclass`, `workshop`, `seminar`, `other`
- New property `display_name`: returns subject name for class sessions, or title/type for custom sessions

**API Changes**:
- `POST /api/live/start/`: Now accepts either `{subject: id}` for class sessions OR `{title: "...", session_type: "hackathon"}` for custom events. At least one of subject or title must be provided.
- `LiveSessionSerializer`: Added `title`, `session_type`, `display_name` fields. `subject_name` and `subject_code` now return null for custom sessions.

**Frontend Changes**:
- `LiveSession.jsx`: Added mode toggle — "Class Session" vs "Custom Event". Custom mode shows title input + type dropdown instead of subject selector. Different gradient styling per mode.
- `LivePulse.jsx`: Updated to use `display_name` instead of `subject_name`. Shows session type for custom sessions.
- Both pages handle null subject gracefully in header/subtitle.

**Migration**: `0002_add_custom_session_fields`

---

## Feature 4: Semester-End Mandatory Feedback Campaigns

Admins can create time-bound feedback collection campaigns targeting specific programs/semesters. Students see a banner on their dashboard showing progress. Admins can track completion rates.

### What Changed

**New Model** (`feedback/models.py`):
- `FeedbackCampaign`: title, description, program FK (nullable for all programs), semester (nullable for all semesters), is_mandatory, start_date, end_date, is_active, created_by FK, created_at
- Property `is_open`: True if active and current time is within start/end dates
- `Feedback` model: added optional `campaign` FK to link feedback to a campaign

**New API Endpoints**:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/campaigns/` | GET | List campaigns (students see only their matching ones) |
| `/api/campaigns/` | POST | Admin creates a campaign |
| `/api/campaigns/<id>/` | GET/PUT/DELETE | Campaign CRUD (admin) |
| `/api/campaigns/my-status/` | GET | Student's progress for all active open campaigns |
| `/api/campaigns/<id>/completion/` | GET | Admin: completion stats for a campaign |

**Student Status Response** (`/api/campaigns/my-status/`):
```json
[{
  "campaign": { "id": 1, "title": "...", "is_mandatory": true, ... },
  "total_subjects": 5,
  "completed_subjects": 3,
  "pending_subjects": [{"id": 4, "name": "...", "code": "CS401"}],
  "completion_percentage": 60.0
}]
```

**Campaign Completion Response** (`/api/campaigns/<id>/completion/`):
```json
{
  "campaign": {...},
  "total_students": 45,
  "total_subjects": 5,
  "expected_submissions": 225,
  "actual_submissions": 180,
  "completed_students": 30,
  "completion_rate": 66.7,
  "submission_rate": 80.0
}
```

**Frontend Changes**:
- New page: `admin/CampaignManagement.jsx` — Full campaign CRUD with create form (title, description, program dropdown, semester, date pickers, mandatory toggle), campaign list with status badges, completion stats modal
- `StudentDashboard.jsx`: Campaign progress banners at top of dashboard. Shows: campaign title, mandatory badge, progress bar, completion %, pending subject chips (clickable to feedback form). Green when complete, red when mandatory+incomplete.
- `App.jsx`: Added route `/admin/campaigns`
- `Sidebar.jsx`: Added "Campaigns" link for admin with Calendar icon
- `api/feedback.js`: Added `getCampaigns`, `createCampaign`, `updateCampaign`, `deleteCampaign`, `getMyCampaignStatus`, `getCampaignCompletion`

**Migration**: `0003_add_feedback_campaign`

---

## New Files Created

**Backend**:
- `livefeedback/migrations/0002_add_custom_session_fields.py`
- `livefeedback/migrations/0003_add_live_questions.py`
- `feedback/migrations/0003_add_feedback_campaign.py`

**Frontend**:
- `src/pages/admin/CampaignManagement.jsx`

## Files Modified

**Backend**:
- `livefeedback/models.py` — Added session_type, title to LiveSession; added LiveQuestion, LiveQuestionVote
- `livefeedback/serializers.py` — Updated LiveSessionSerializer; added LiveQuestionSerializer
- `livefeedback/views.py` — Updated StartSessionView; added SessionStudentsView, SubmitQuestionView, ListQuestionsView, UpvoteQuestionView, MarkQuestionAnsweredView
- `livefeedback/urls.py` — Added 5 new URL patterns
- `livefeedback/admin.py` — Updated LiveSessionAdmin; registered LiveQuestion, LiveQuestionVote
- `feedback/models.py` — Added FeedbackCampaign; added campaign FK to Feedback
- `feedback/serializers.py` — Added FeedbackCampaignSerializer, CampaignStudentStatusSerializer; updated FeedbackCreateSerializer
- `feedback/views.py` — Added CampaignViewSet, CampaignStudentStatusView, CampaignCompletionView
- `feedback/urls.py` — Added campaign routes
- `feedback/admin.py` — Registered FeedbackCampaign

**Frontend**:
- `src/api/live.js` — Added question and student list API functions
- `src/api/feedback.js` — Added campaign API functions
- `src/pages/faculty/LiveSession.jsx` — Added custom session toggle, students modal, questions panel
- `src/pages/student/LivePulse.jsx` — Added reactions/questions tabs with full Q&A UI
- `src/pages/student/StudentDashboard.jsx` — Added campaign status banners
- `src/components/layout/Sidebar.jsx` — Added Campaigns link for admin
- `src/App.jsx` — Added `/admin/campaigns` route

---

## Summary of New API Endpoints

| # | Endpoint | Method | Auth | Description |
|---|----------|--------|------|-------------|
| 1 | `/api/live/students/<session_id>/` | GET | Faculty/Admin | Active/missing student lists |
| 2 | `/api/live/questions/` | POST | Authenticated | Submit a question |
| 3 | `/api/live/questions/<session_id>/` | GET | Authenticated | List session questions |
| 4 | `/api/live/questions/<id>/upvote/` | POST | Authenticated | Toggle question upvote |
| 5 | `/api/live/questions/<id>/answered/` | POST | Faculty/Admin | Toggle answered status |
| 6 | `/api/campaigns/` | GET/POST | Auth/Admin | List/create campaigns |
| 7 | `/api/campaigns/<id>/` | GET/PUT/DELETE | Auth/Admin | Campaign CRUD |
| 8 | `/api/campaigns/my-status/` | GET | Student | Campaign progress |
| 9 | `/api/campaigns/<id>/completion/` | GET | Admin | Campaign completion stats |
