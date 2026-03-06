# Changelog

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
