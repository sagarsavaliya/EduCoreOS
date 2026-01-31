import json, random
from faker import Faker
from datetime import datetime, timedelta

fake = Faker("en_IN")

SCHEMA_FILE = "mock-data-schema.json"
OUT = "institution_full.json"

INSTITUTES = 3
STUDENTS_PER_INSTITUTE = 100   # 3×500 = 1500 students (stress)
BATCH_CAPACITY = 2
ATTENDANCE_DAYS = 30
TESTS_PER_BATCH = 5
PAYMENTS_PER_STUDENT = 2

with open(SCHEMA_FILE) as f:
    schema = json.load(f)["properties"]

data = {k: [] for k in schema.keys()}
idc = {k: 1 for k in data.keys()}

def nid(t): i=idc[t]; idc[t]+=1; return i
def dstr(): return fake.date_between(start_date="-1y", end_date="today").isoformat()
def tstr(h): return f"{h:02d}:00"

# ---- institutes
for _ in range(INSTITUTES):
    data["institutes"].append({
        "id": nid("institutes"),
        "name": fake.company(), "type":"school",
        "address": fake.address(), "city": fake.city(), "state": fake.state(),
        "pincode": fake.postcode(), "phone": fake.phone_number(), "email": fake.email(),
        "gstin": "GST"+str(random.randint(100000,999999)),
        "logo_url":"logo.png", "owner_name":fake.name(), "owner_email":fake.email(),
        "owner_phone":fake.phone_number(), "status":"active",
        "subscription_plan":"pro", "subscription_expires_at":"2026-03-31",
        "created_at": datetime.now().isoformat()
    })

# ---- branches + academic years
for inst in data["institutes"]:
    b={"id":nid("branches"),"institute_id":inst["id"],"name":"Main",
       "address":fake.address(),"contact_person":fake.name(),
       "phone":fake.phone_number(),"email":fake.email(),"status":"active",
       "capacity_max_students":9999,"opening_date":"2020-04-01"}
    data["branches"].append(b)
    data["academic_years"].append({
        "id":nid("academic_years"),"institute_id":inst["id"],"branch_id":b["id"],
        "name":"2025-26","start_date":"2025-04-01","end_date":"2026-03-31",
        "status":"active","is_locked":False
    })

# ---- mediums + standards
for inst in data["institutes"]:
    for m in ["English","Gujarati"]:
        data["mediums"].append({"id":nid("mediums"),"institute_id":inst["id"],
                                "name":m,"code":m[:3].upper(),"status":"active"})
    for i,s in enumerate(["8th","9th","10th","11th","12th"],1):
        data["standards"].append({"id":nid("standards"),"institute_id":inst["id"],
                                  "name":s,"sort_order":i,"status":"active"})

# ---- subjects
for st in data["standards"]:
    for s in ["Math","Science","English"]:
        data["subjects"].append({"id":nid("subjects"),"institute_id":st["institute_id"],
                                 "standard_id":st["id"],"name":s,"code":s[:3].upper(),"status":"active"})

# ---- teachers
for br in data["branches"]:
    for _ in range(20):
        data["teachers"].append({
            "id":nid("teachers"),"institute_id":br["institute_id"],"branch_id":br["id"],
            "employee_code":"EMP"+str(random.randint(1000,9999)),
            "first_name":fake.first_name(),"last_name":fake.last_name(),
            "email":fake.email(),"phone":fake.phone_number(),"alternate_phone":fake.phone_number(),
            "gender":random.choice(["Male","Female"]),
            "date_of_birth":fake.date_of_birth(minimum_age=28, maximum_age=55).isoformat(),
            "qualification":"MSc","specialization":random.choice(["Math","Science","English"]),
            "experience_years":random.randint(2,20),"joining_date":"2022-06-01",
            "address":fake.address(),"city":fake.city(),"state":fake.state(),
            "pincode":fake.postcode(),"status":"active","photo_url":"t.jpg"
        })

# ---- students + parents + relations
for br in data["branches"]:
    ay=[a for a in data["academic_years"] if a["branch_id"]==br["id"]][0]
    stds=[s for s in data["standards"] if s["institute_id"]==br["institute_id"]]
    meds=[m for m in data["mediums"] if m["institute_id"]==br["institute_id"]]
    for _ in range(STUDENTS_PER_INSTITUTE):
        std=random.choice(stds); med=random.choice(meds)
        sid=nid("students")
        data["students"].append({
            "id":sid,"institute_id":br["institute_id"],"branch_id":br["id"],
            "academic_year_id":ay["id"],"standard_id":std["id"],"medium_id":med["id"],
            "admission_number":"A"+str(sid),"roll_number":str(sid),
            "first_name":fake.first_name(),"last_name":fake.last_name(),
            "email":fake.email(),"phone":fake.phone_number(),
            "gender":random.choice(["Male","Female"]),
            "date_of_birth":fake.date_of_birth(minimum_age=12, maximum_age=18).isoformat(),
            "address":fake.address(),"city":fake.city(),"state":fake.state(),
            "pincode":fake.postcode(),"admission_date":"2025-04-01",
            "status":"active","photo_url":"s.jpg"
        })
        pid=nid("parents")
        data["parents"].append({
            "id":pid,"first_name":fake.first_name(),"last_name":fake.last_name(),
            "email":fake.email(),"phone":fake.phone_number(),"alternate_phone":fake.phone_number(),
            "occupation":"Business","annual_income":"800000",
            "address":fake.address(),"city":fake.city(),"state":fake.state(),"pincode":fake.postcode()
        })
        data["student_parent_relations"].append({"student_id":sid,"parent_id":pid,"relation":"Father"})

# ---- batches + batch_students
for br in data["branches"]:
    ay=[a for a in data["academic_years"] if a["branch_id"]==br["id"]][0]
    stds=[s for s in data["standards"] if s["institute_id"]==br["institute_id"]]
    meds=[m for m in data["mediums"] if m["institute_id"]==br["institute_id"]]
    studs=[s for s in data["students"] if s["branch_id"]==br["id"]]
    for std in stds:
        for med in meds:
            b={"id":nid("batches"),"institute_id":br["institute_id"],"branch_id":br["id"],
               "academic_year_id":ay["id"],"standard_id":std["id"],"medium_id":med["id"],
               "name":f"{std['name']}-{med['name']}", "capacity":BATCH_CAPACITY,"status":"active"}
            data["batches"].append(b)
            chunk=[s for s in studs if s["standard_id"]==std["id"] and s["medium_id"]==med["id"]]
            for s in chunk:
                data["batch_students"].append({"batch_id":b["id"],"student_id":s["id"],"enrollment_date":"2025-04-01"})

# ---- batch_teachers + timetable
for b in data["batches"]:
    subs=[s for s in data["subjects"] if s["standard_id"]==b["standard_id"]]
    teach=[t for t in data["teachers"] if t["branch_id"]==b["branch_id"]]
    for s in subs:
        t=random.choice(teach)
        data["batch_teachers"].append({"batch_id":b["id"],"teacher_id":t["id"],"subject_id":s["id"],"assigned_date":"2025-04-01"})
        data["timetable"].append({
            "id":nid("timetable"),"institute_id":b["institute_id"],"branch_id":b["branch_id"],
            "academic_year_id":b["academic_year_id"],"batch_id":b["id"],
            "subject_id":s["id"],"teacher_id":t["id"],
            "day_of_week":random.choice(["Mon","Tue","Wed","Thu","Fri"]),
            "start_time":tstr(random.randint(9,14)),"end_time":tstr(random.randint(15,18)),"status":"active"
        })

# ---- users
for inst in data["institutes"]:
    data["users"].append({"id":nid("users"),"institute_id":inst["id"],"name":"Admin",
                          "email":fake.email(),"phone":fake.phone_number(),
                          "password":"hash","role":"admin","is_active":True,
                          "last_login_at":datetime.now().isoformat(),"created_at":datetime.now().isoformat()})
for t in data["teachers"]:
    data["users"].append({"id":nid("users"),"institute_id":t["institute_id"],"name":t["first_name"],
                          "email":t["email"],"phone":t["phone"],"password":"hash","role":"teacher",
                          "is_active":True,"last_login_at":dstr(),"created_at":dstr()})
for s in data["students"]:
    data["users"].append({"id":nid("users"),"institute_id":s["institute_id"],"name":s["first_name"],
                          "email":s["email"],"phone":s["phone"],"password":"hash","role":"student",
                          "is_active":True,"last_login_at":dstr(),"created_at":dstr()})

# ---- fee_structures, payments, ledgers
for b in data["batches"]:
    fs={"id":nid("fee_structures"),"institute_id":b["institute_id"],"branch_id":b["branch_id"],
        "academic_year_id":b["academic_year_id"],"standard_id":b["standard_id"],
        "name":"Annual Fee","total_amount":random.randint(20000,60000),"currency":"INR",
        "frequency":"yearly","due_date":"2025-06-30","status":"active"}
    data["fee_structures"].append(fs)

for s in data["students"]:
    fs=random.choice(data["fee_structures"])
    bal=fs["total_amount"]
    for _ in range(PAYMENTS_PER_STUDENT):
        pay=min(bal, fs["total_amount"]//PAYMENTS_PER_STUDENT)
        pid=nid("fee_payments")
        data["fee_payments"].append({"id":pid,"institute_id":s["institute_id"],"branch_id":s["branch_id"],
                                     "student_id":s["id"],"amount":pay,"payment_date":dstr(),
                                     "payment_method":"UPI","transaction_id":"TXN"+str(pid),
                                     "status":"success","received_by_user_id":1})
        bal-=pay
        data["fee_ledgers"].append({"id":nid("fee_ledgers"),"institute_id":s["institute_id"],
                                    "branch_id":s["branch_id"],"student_id":s["id"],
                                    "academic_year_id":s["academic_year_id"],"fee_structure_id":fs["id"],
                                    "transaction_date":dstr(),"transaction_type":"payment",
                                    "amount":pay,"balance":bal,"description":"fee",
                                    "created_by_user_id":1,"payment_id":pid})

# ---- tests + marks
for b in data["batches"]:
    subs=[s for s in data["subjects"] if s["standard_id"]==b["standard_id"]]
    studs=[x for x in data["batch_students"] if x["batch_id"]==b["id"]]
    for _ in range(TESTS_PER_BATCH):
        sub=random.choice(subs)
        tid=nid("tests")
        data["tests"].append({"id":tid,"institute_id":b["institute_id"],"branch_id":b["branch_id"],
                              "academic_year_id":b["academic_year_id"],"batch_id":b["id"],
                              "subject_id":sub["id"],"name":"Unit Test","test_date":dstr(),
                              "max_marks":100,"passing_marks":35,"weightage":10,"status":"published",
                              "created_by_user_id":1})
        for st in studs:
            data["marks"].append({"id":nid("marks"),"test_id":tid,"student_id":st["student_id"],
                                  "marks_obtained":random.randint(30,95),"remarks":"ok",
                                  "marked_by_user_id":1,"marked_at":dstr()})

# ---- attendance
for b in data["batches"]:
    studs=[x for x in data["batch_students"] if x["batch_id"]==b["id"]]
    for d in range(ATTENDANCE_DAYS):
        ad=(datetime(2025,6,1)+timedelta(days=d)).date().isoformat()
        for st in studs:
            data["attendance"].append({"id":nid("attendance"),"institute_id":b["institute_id"],
                                       "branch_id":b["branch_id"],"academic_year_id":b["academic_year_id"],
                                       "batch_id":b["id"],"student_id":st["student_id"],
                                       "attendance_date":ad,"timetable_id":1,"status":random.choice(["Present","Absent"]),
                                       "marked_by_user_id":1,"marked_at":dstr(),"is_locked":False})

# ---- announcements, assignments, audit_logs
for inst in data["institutes"]:
    for _ in range(10):
        data["announcements"].append({"id":nid("announcements"),"institute_id":inst["id"],
                                      "branch_id":1,"title":"Notice","message":"Important",
                                      "target_audience":"all","priority":"normal",
                                      "published_at":dstr(),"created_by_user_id":1,"status":"active"})
for b in data["batches"]:
    for _ in range(5):
        data["assignments"].append({"id":nid("assignments"),"institute_id":b["institute_id"],
                                    "branch_id":b["branch_id"],"academic_year_id":b["academic_year_id"],
                                    "batch_id":b["id"],"subject_id":random.choice(data["subjects"])["id"],
                                    "title":"HW","description":"Solve","assigned_date":dstr(),"due_date":dstr(),
                                    "max_marks":20,"created_by_user_id":1,"status":"active"})
for _ in range(2000):
    inst=random.choice(data["institutes"])
    data["audit_logs"].append({"id":nid("audit_logs"),"institute_id":inst["id"],"user_id":1,
                              "action":"update","entity_type":"student","entity_id":random.randint(1,len(data["students"])),
                              "changes":"{}", "ip_address":"127.0.0.1","user_agent":"browser",
                              "created_at":dstr()})

with open(OUT,"w") as f: json.dump(data,f)
print("DONE:", OUT)
