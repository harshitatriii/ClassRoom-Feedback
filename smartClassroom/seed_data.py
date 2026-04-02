"""
Seed data script for Smart Classroom Feedback System.
KR Mangalam University - Real Schools & Programs
Run: python seed_data.py
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartClassroom.settings')

import django
django.setup()

from courses.models import School, Program, Subject
from accounts.models import CustomUser
from feedback.models import Feedback
from analysis.models import SentimentResult

# ============================================================
# CLEANUP OLD DUMMY DATA
# ============================================================
print('--- Cleaning old dummy data ---')

# Delete old dummy feedback & sentiment results
deleted, _ = SentimentResult.objects.all().delete()
print(f'  Deleted {deleted} sentiment results')

deleted, _ = Feedback.objects.all().delete()
print(f'  Deleted {deleted} feedbacks')

deleted, _ = Subject.objects.all().delete()
print(f'  Deleted {deleted} subjects')

# Delete old dummy users (faculty & students, keep superusers)
deleted, _ = CustomUser.objects.filter(role__in=['faculty', 'student']).delete()
print(f'  Deleted {deleted} dummy users')

# Delete old dummy programs & schools
deleted, _ = Program.objects.all().delete()
print(f'  Deleted {deleted} old programs')

deleted, _ = School.objects.all().delete()
print(f'  Deleted {deleted} old schools')

# ============================================================
# SCHOOLS
# ============================================================
print('\n--- Creating Schools ---')

schools_data = [
    ('SAS', 'School of Agricultural Sciences'),
    ('SMC', 'School of Management and Commerce'),
    ('SOET', 'School of Engineering & Technology'),
    ('SLS', 'School of Legal Studies'),
    ('SPRS', 'School of Physiotherapy and Rehabilitation Sciences'),
    ('SMAS', 'School of Medical & Allied Sciences'),
    ('SLA', 'School of Liberal Arts'),
    ('SAD', 'School of Architecture & Design'),
    ('SBAS', 'School of Basic & Applied Sciences'),
    ('SEMCE', 'School of Emerging Media and Creator Economy'),
    ('SHMCT', 'School of Hotel Management & Catering Technology'),
    ('SOE', 'School of Education'),
]

schools = {}
for code, name in schools_data:
    school, _ = School.objects.get_or_create(code=code, defaults={'name': name})
    schools[code] = school
    print(f'  {code} - {name}')

# ============================================================
# PROGRAMS  (total_semesters = years * 2)
# ============================================================
print('\n--- Creating Programs ---')

programs_data = [
    # School of Agricultural Sciences
    ('BSCAGRI', 'B.Sc. (Hons.) Agriculture', 'SAS', 8),

    # School of Management and Commerce
    ('BBAHR3', 'BBA (Human Resource)', 'SMC', 6),
    ('BSCFIN', 'BSc (Hons) in Finance (with optional specialisations in Quantitative Finance and Actuarial Science)', 'SMC', 8),
    ('BBAHR4', 'BBA (Hons. / Hons. with Research) Human Resource', 'SMC', 8),
    ('BBAMKT3', 'BBA Marketing', 'SMC', 6),
    ('BBAMKT4', 'BBA (Hons. / Hons. with Research) Marketing', 'SMC', 8),
    ('BBAFIN3', 'BBA Finance', 'SMC', 6),
    ('BBAFIN4', 'BBA (Hons. / Hons. with Research) in Finance', 'SMC', 8),
    ('BBADM4', 'BBA (Hons. / Hons. with Research) Digital Marketing with academic support of IIDE', 'SMC', 8),
    ('BBADM3', 'BBA (Digital Marketing) with academic support of IIDE', 'SMC', 6),
    ('BBAIB3', 'BBA International Business', 'SMC', 6),
    ('BBAIB4', 'BBA (Hons. / Hons. with Research) in International Business', 'SMC', 8),
    ('BBATT3', 'BBA Travel and Tourism', 'SMC', 6),

    # School of Engineering & Technology
    ('BTECHCSE', 'B.Tech. Computer Science and Engineering (CSE)', 'SOET', 8),
    ('BTECHRAI', 'B.Tech. CSE (Robotics & Artificial Intelligence) with Academic Support of IBM & powered by Microsoft Certifications', 'SOET', 8),
    ('BTECHAIML', 'B.Tech. Computer Science and Engineering (AI & ML) with academic support of IBM & powered by Microsoft Certifications', 'SOET', 8),
    ('BTECHCS', 'B.Tech. CSE (Cybersecurity) with academic support of EC-Council & IBM', 'SOET', 8),
    ('BTECHDS', 'B.Tech. CSE (Data Science) with academic support of IBM', 'SOET', 8),
    ('BTECHFSD', 'B.Tech. CSE (Full Stack Development) with academic support of ImaginXP', 'SOET', 8),
    ('BTECHUX', 'B.Tech. CSE (UX/UI) with Academic Support of ImaginXP', 'SOET', 8),
    ('BCAAI3', 'BCA (AI & Data Science) with academic support of IBM & powered by Microsoft Certifications', 'SOET', 6),
    ('BCACS4', 'BCA (Hons. / Hons. with Research) Cyber Security with academic support of EC-Council', 'SOET', 8),
    ('BCACS3', 'BCA (Cyber Security) with academic support of EC-Council', 'SOET', 6),
    ('BCAAI4', 'BCA (Hons. / Hons. with Research) AI & Data Science with academic support from IBM & powered by Microsoft Certifications', 'SOET', 8),
    ('BSCCS', 'B.Sc. (Hons.) Computer Science with academic support of IBM', 'SOET', 6),
    ('BSCCSEC', 'B.Sc. (Hons.) Cyber Security', 'SOET', 6),
    ('BSCDS', 'B.Sc. (Hons.) Data Science', 'SOET', 6),
    ('BTECHSD', 'B.Tech. Computer Science and Engineering (Semiconductor Design)', 'SOET', 8),
    ('BTECHCC', 'B.Tech. Computer Science and Engineering (Cloud Computing) powered by Microsoft Certifications', 'SOET', 8),

    # School of Legal Studies
    ('BBALLB', 'BBA LL.B. (Hons.)', 'SLS', 10),
    ('BALLB', 'B.A. LL.B. (Hons.)', 'SLS', 10),
    ('LLB', 'LL.B. (Hons.)', 'SLS', 6),

    # School of Physiotherapy and Rehabilitation Sciences
    ('BPT', 'Bachelor of Physiotherapy (BPT)', 'SPRS', 10),

    # School of Medical & Allied Sciences
    ('BPHARM', 'B.Pharm.', 'SMAS', 8),
    ('BEMT', 'Bachelor of Emergency Medical Technologist (Paramedic) (B.EMT) with Academic & Industry support of Emversity', 'SMAS', 8),
    ('BRT', 'Bachelor of Respiratory Technology (B.RT) with Academic & Industry support of Emversity', 'SMAS', 8),
    ('BSCCVT', 'B.Sc. (Hons.) Cardiovascular Technology with Academic & Industry support of Emversity', 'SMAS', 8),
    ('BPHARML', 'B.Pharm. (Lateral)', 'SMAS', 6),

    # School of Liberal Arts
    ('BAENG3', 'B.A. (Hons.) English', 'SLA', 6),
    ('BAENG4', 'B.A. (Hons. / Hons. with Research) English', 'SLA', 8),
    ('BAECO3', 'B.A. (Hons.) Economics', 'SLA', 6),
    ('BAECO4', 'B.A. (Hons. / Hons. with Research) Economics', 'SLA', 8),
    ('BAPSY3', 'B.A. (Hons.) Psychology', 'SLA', 6),
    ('BAPSY4', 'B.A. (Hons. / Hons. with Research) Psychology', 'SLA', 8),
    ('BAPOL3', 'B.A. (Hons.) Political Science', 'SLA', 6),
    ('BAPROG', 'B.A. Programme', 'SLA', 6),
    ('BAPOL4', 'B.A. (Hons. / Hons. with Research) Political Science', 'SLA', 8),
    ('BALA4', 'B.A. (Hons. / Hons. with Research) Liberal Arts', 'SLA', 8),
    ('BSCCP', 'B.Sc. Clinical Psychology (Hons.)', 'SLA', 8),

    # School of Architecture & Design
    ('BARCH', 'Bachelor of Architecture (B.Arch)', 'SAD', 10),
    ('BFA', 'Bachelor of Fine Arts (BFA)', 'SAD', 8),
    ('BDESFASH', 'B.Des. (Hons. / Hons. with Research) Fashion Design', 'SAD', 8),
    ('BDESINT', 'B.Des. (Hons. / Hons. with Research) Interior Design', 'SAD', 8),
    ('BDESGAME', 'B.Des. (Hons. / Hons. with Research) Game Design & Animation', 'SAD', 8),
    ('BDESUXUI', 'B.Des. (Hons. / Hons. with Research) UX/UI & Interaction Design', 'SAD', 8),

    # School of Basic & Applied Sciences
    ('BSCPHY', 'B.Sc. (Hons. / Hons. with Research) Physics', 'SBAS', 8),
    ('BSCCHE', 'B.Sc. (Hons. / Hons. with Research) Chemistry', 'SBAS', 8),
    ('BSCMATH', 'B.Sc. (Hons. / Hons. with Research) Maths', 'SBAS', 8),
    ('BSCFS3', 'B.Sc. (Hons.) Forensic Science', 'SBAS', 6),
    ('BSCFS4', 'B.Sc. (Hons. / Hons. with Research) Forensic Science', 'SBAS', 8),
    ('BSCMSCFS', 'Integrated / Dual Degree B.Sc.-M.Sc. (Forensic Science)', 'SBAS', 10),

    # School of Emerging Media and Creator Economy
    ('BAJMC3', 'B.A. (Journalism & Mass Communication)', 'SEMCE', 6),
    ('BAJMC4', 'B.A. (Hons. / Hons. with Research) Journalism & Mass Communication', 'SEMCE', 8),

    # School of Hotel Management & Catering Technology
    ('BHMCT', 'Bachelor of Hotel Management and Catering Technology', 'SHMCT', 8),

    # School of Education
    ('BED', 'Bachelor of Education (B.Ed.)', 'SOE', 4),
    ('BELED', 'Bachelor of Elementary Education (B.El.Ed.)', 'SOE', 8),
]

for code, name, school_code, semesters in programs_data:
    program, _ = Program.objects.get_or_create(
        code=code,
        defaults={
            'name': name,
            'school': schools[school_code],
            'total_semesters': semesters,
        },
    )
    print(f'  {code} - {name} ({school_code}, {semesters} sem)')

# ============================================================
# SUMMARY
# ============================================================
print(f'\n--- Summary ---')
print(f'Schools: {School.objects.count()}')
print(f'Programs: {Program.objects.count()}')
print(f'Admin users: {CustomUser.objects.filter(is_superuser=True).count()}')
print('\nDone! All seed data created.')
print('Note: Add subjects, faculty, and students via the admin panel or register page.')
