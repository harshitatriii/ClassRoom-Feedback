"""
Seed data script for Smart Classroom Feedback System.
Run: python seed_data.py
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartClassroom.settings')

import django
django.setup()

from accounts.models import CustomUser
from courses.models import School, Program, Subject
from feedback.models import Feedback

# --- Schools ---
soet, _ = School.objects.get_or_create(
    code='SOET',
    defaults={'name': 'School of Engineering & Technology'},
)
print(f'  School: {soet.code}')

soms, _ = School.objects.get_or_create(
    code='SOMS',
    defaults={'name': 'School of Management Studies'},
)
print(f'  School: {soms.code}')

# --- Programs ---
btech, _ = Program.objects.get_or_create(
    code='BTECH',
    defaults={'name': 'Bachelor of Technology', 'school': soet, 'total_semesters': 8},
)
print(f'  Program: {btech.code} ({btech.school.code}, {btech.total_semesters} semesters)')

bca, _ = Program.objects.get_or_create(
    code='BCA',
    defaults={'name': 'Bachelor of Computer Applications', 'school': soet, 'total_semesters': 6},
)
print(f'  Program: {bca.code} ({bca.school.code}, {bca.total_semesters} semesters)')

bba, _ = Program.objects.get_or_create(
    code='BBA',
    defaults={'name': 'Bachelor of Business Administration', 'school': soms, 'total_semesters': 6},
)
print(f'  Program: {bba.code} ({bba.school.code}, {bba.total_semesters} semesters)')

# --- Faculty ---
faculty_data = [
    {'username': 'prof_sharma', 'first_name': 'Rajesh', 'last_name': 'Sharma',
     'email': 'sharma@college.edu', 'school': soet, 'faculty_id': 'FAC001'},
    {'username': 'prof_gupta', 'first_name': 'Priya', 'last_name': 'Gupta',
     'email': 'gupta@college.edu', 'school': soet, 'faculty_id': 'FAC002'},
    {'username': 'prof_singh', 'first_name': 'Amit', 'last_name': 'Singh',
     'email': 'singh@college.edu', 'school': soet, 'faculty_id': 'FAC003'},
]

faculty_users = []
for data in faculty_data:
    user, created = CustomUser.objects.get_or_create(
        username=data['username'],
        defaults={**data, 'role': 'faculty'},
    )
    if created:
        user.set_password('faculty123')
        user.save()
        print(f'  Created faculty: {user.username}')
    faculty_users.append(user)

# --- Students ---
student_data = [
    {'username': 'student1', 'first_name': 'Ankit', 'last_name': 'Kumar',
     'email': 'ankit@student.edu', 'school': soet, 'program': btech,
     'current_semester': 5, 'enrollment_no': 'EN2021001'},
    {'username': 'student2', 'first_name': 'Sneha', 'last_name': 'Patel',
     'email': 'sneha@student.edu', 'school': soet, 'program': btech,
     'current_semester': 5, 'enrollment_no': 'EN2021002'},
    {'username': 'student3', 'first_name': 'Rahul', 'last_name': 'Verma',
     'email': 'rahul@student.edu', 'school': soet, 'program': btech,
     'current_semester': 7, 'enrollment_no': 'EN2021003'},
    {'username': 'student4', 'first_name': 'Pooja', 'last_name': 'Jain',
     'email': 'pooja@student.edu', 'school': soet, 'program': bca,
     'current_semester': 5, 'enrollment_no': 'EN2021004'},
    {'username': 'student5', 'first_name': 'Vikram', 'last_name': 'Reddy',
     'email': 'vikram@student.edu', 'school': soet, 'program': btech,
     'current_semester': 5, 'enrollment_no': 'EN2021005'},
]

student_users = []
for data in student_data:
    user, created = CustomUser.objects.get_or_create(
        username=data['username'],
        defaults={**data, 'role': 'student'},
    )
    if created:
        user.set_password('student123')
        user.save()
        print(f'  Created student: {user.username}')
    student_users.append(user)

# --- Subjects ---
subject_data = [
    {'name': 'Data Structures & Algorithms', 'code': 'CS301', 'program': btech,
     'semester': 5, 'faculty': faculty_users[0], 'academic_year': '2025-26'},
    {'name': 'Machine Learning', 'code': 'CS401', 'program': btech,
     'semester': 7, 'faculty': faculty_users[0], 'academic_year': '2025-26'},
    {'name': 'Database Management Systems', 'code': 'CS302', 'program': btech,
     'semester': 5, 'faculty': faculty_users[1], 'academic_year': '2025-26'},
    {'name': 'Web Development', 'code': 'CS303', 'program': btech,
     'semester': 6, 'faculty': faculty_users[1], 'academic_year': '2025-26'},
    {'name': 'Digital Signal Processing', 'code': 'EC401', 'program': btech,
     'semester': 7, 'faculty': faculty_users[2], 'academic_year': '2025-26'},
]

subjects = []
for data in subject_data:
    subject, created = Subject.objects.get_or_create(
        code=data['code'],
        defaults=data,
    )
    if created:
        print(f'  Created subject: {subject.code} - {subject.name}')
    subjects.append(subject)

# --- Feedback (with varying sentiments) ---
feedback_data = [
    # Positive feedback
    (student_users[0], subjects[0], 5, 5, 4, 5,
     "Excellent teaching! Professor Sharma explains data structures very clearly with great practical examples. The lecture notes are well organized and easy to follow."),
    (student_users[1], subjects[0], 4, 4, 5, 4,
     "Great course with interactive sessions. The professor encourages participation and makes the subject interesting. Really enjoyed the hands-on coding exercises."),
    (student_users[2], subjects[0], 4, 5, 4, 4,
     "Very good content and teaching methodology. The syllabus is well structured and covers all important topics thoroughly."),

    # Mixed feedback
    (student_users[0], subjects[1], 4, 3, 3, 3,
     "Machine learning concepts are taught well but the course material could be more up to date. Some slides are outdated. Needs more practical assignments."),
    (student_users[1], subjects[1], 3, 4, 3, 3,
     "Good theoretical foundation but lectures can be a bit boring sometimes. Would appreciate more interactive discussions and group activities."),

    # Positive feedback for different subject
    (student_users[0], subjects[2], 5, 5, 5, 5,
     "Professor Gupta is amazing! The DBMS course is incredibly well structured with excellent teaching. Every concept is explained clearly with real-world examples."),
    (student_users[2], subjects[2], 4, 5, 4, 5,
     "One of the best courses this semester. The content is comprehensive and the professor is very clear in explanations. Great resource material provided."),
    (student_users[4], subjects[2], 5, 4, 5, 5,
     "Brilliant course! Very engaging lectures with lots of participation opportunities. The professor makes database concepts easy to understand."),

    # Negative feedback
    (student_users[1], subjects[3], 2, 2, 1, 2,
     "The web development course is disappointing. Teaching is not clear and the content is very outdated. No practical sessions at all. Very boring lectures."),
    (student_users[2], subjects[3], 2, 3, 2, 2,
     "Not a good experience. The instructor rushes through topics without proper explanation. Material is confusing and hard to follow."),
    (student_users[4], subjects[3], 3, 2, 2, 2,
     "Below expectations. The content needs major updates and the teaching methodology should include more hands-on practice. Students are disengaged."),

    # Mixed Electronics course
    (student_users[3], subjects[4], 4, 4, 3, 4,
     "Decent course on signal processing. The professor knows the subject well but could make lectures more engaging. Good textbook recommendations."),
    (student_users[4], subjects[4], 3, 3, 4, 3,
     "Average course overall. Some interesting practical demonstrations but the theory part can be dry. Would benefit from more interactive teaching."),
]

for student, subject, rt, rc, re, ro, text in feedback_data:
    _, created = Feedback.objects.get_or_create(
        student=student,
        subject=subject,
        defaults={
            'rating_teaching': rt,
            'rating_content': rc,
            'rating_engagement': re,
            'rating_overall': ro,
            'text_feedback': text,
            'is_anonymous': True,
        },
    )
    if created:
        print(f'  Created feedback: {student.username} -> {subject.code}')

# Summary
print(f'\n--- Summary ---')
print(f'Schools: {School.objects.count()}')
print(f'Programs: {Program.objects.count()}')
print(f'Users: {CustomUser.objects.count()} ({CustomUser.objects.filter(role="admin").count()} admin, {CustomUser.objects.filter(role="faculty").count()} faculty, {CustomUser.objects.filter(role="student").count()} students)')
print(f'Subjects: {Subject.objects.count()}')
print(f'Feedback: {Feedback.objects.count()}')
from analysis.models import SentimentResult
print(f'Sentiment Results: {SentimentResult.objects.count()}')
print('\nDone! All seed data created.')
