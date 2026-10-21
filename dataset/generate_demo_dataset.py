import csv
import random
import os

# EMSCAD dataset column names
HEADERS = [
    "job_id", "title", "location", "department", "salary_range",
    "company_profile", "description", "requirements", "benefits",
    "telecommuting", "has_company_logo", "has_questions",
    "employment_type", "required_experience", "required_education",
    "industry", "function", "fraudulent"
]

GENUINE_TITLES = [
    "Senior Full Stack Software Engineer", "Data Scientist", "Frontend React Developer",
    "DevOps Infrastructure Engineer", "Product Manager", "UX/UI Product Designer",
    "Backend Python Engineer", "QA Automation Engineer", "Cloud Solutions Architect",
    "Technical Support Engineer", "Marketing Operations Specialist", "Financial Analyst",
    "Human Resources Business Partner", "Cybersecurity Specialist", "Account Executive",
    "Database Administrator", "Mobile App Developer (iOS/Android)", "Scrum Master"
]

GENUINE_COMPANIES = [
    "Nexus Technologies is an enterprise cloud software company founded in 2012 with over 500 employees globally.",
    "Apex Analytics delivers machine learning solutions to healthcare and financial institutions worldwide.",
    "CloudScale Systems builds distributed cloud infrastructure for Fortune 500 enterprises with high availability.",
    "Innovate Health is a leading digital health solutions platform empowering healthcare providers across North America.",
    "FinTech Dynamics provides secure payment processing and digital banking technology for modern financial institutions."
]

GENUINE_DESCRIPTIONS = [
    "We are looking for an experienced engineer to join our core architecture team. You will build scalable microservices using Python and React.",
    "Join our data science division to design predictive ML models and optimize client data pipelines in a collaborative environment.",
    "Seeking a product designer to lead user research, create wireframes, and refine our design system across desktop and web.",
    "Responsible for maintaining automated CI/CD pipelines, managing AWS Kubernetes clusters, and ensuring high system reliability."
]

GENUINE_REQUIREMENTS = [
    "Bachelor degree in Computer Science or related STEM field. 3+ years experience with Python, React, Docker, and PostgreSQL.",
    "Proven track record in data analysis, SQL proficiency, scikit-learn experience, and strong analytical problem-solving skills.",
    "5+ years of software engineering experience, knowledge of REST APIs, Git workflows, and Agile development methodologies."
]

GENUINE_BENEFITS = [
    "Health, dental, and vision insurance. 401(k) matching up to 5%. Flexible remote work policies and 20 days paid PTO.",
    "Competitive salary, annual performance bonus, learning stipend, health wellness budget, and hybrid office flexibility."
]

SUSPICIOUS_TITLES = [
    "Data Entry Assistant - Earn $5000/Week - Immediate Start",
    "Work From Home Payment Processing Clerk - No Experience Needed",
    "Remote Mystery Shopper / Financial Transfer Agent",
    "Online Re-shipping Specialist - Urgent Hiring - High Daily Pay",
    "Customer Service Assistant - Wire Transfer Representative",
    "Virtual Personal Assistant - Earn $1000 Daily - Easy Money"
]

SUSPICIOUS_DESCRIPTIONS = [
    "Earn massive income from home! Work 1-2 hours per day processing wire transfers and handling customer checks. Send registration fee to apply.",
    "Urgent hiring! Immediate payment via wire transfer or crypto. No experience needed. Pay $50 registration fee for starter kit.",
    "Work from home processing payments. Must have active bank account for receiving money transfers. Contact us on WhatsApp or Telegram immediately.",
    "Make $5000 weekly doing simple online re-shipping and payment processing. Security deposit required for equipment allocation."
]

SUSPICIOUS_REQUIREMENTS = [
    "No experience needed. Must have valid personal bank account and Telegram app. Must deposit $100 application processing fee.",
    "Open to anyone! Must be willing to transfer funds using personal bank account or Bitcoin wallet. Contact recruit-job@gmail.com."
]

SUSPICIOUS_BENEFITS = [
    "Daily cash payout, flexible hours, work 1 hour a day, high commissions, immediate payment.",
    "Earn $500 daily, work from anywhere, no background check, instant payment to personal account."
]

LOCATIONS = ["US, CA, San Francisco", "US, NY, New York", "US, TX, Austin", "GB, LND, London", "CA, ON, Toronto", "US, WA, Seattle"]
SALARIES = ["$90,000-$120,000", "$110,000-$150,000", "$70,000-$90,000", "$130,000-$160,000", ""]
SUSPICIOUS_SALARIES = ["$200,000-$300,000", "$5,000/week", "$1,000/day", ""]
EMP_TYPES = ["Full-time", "Part-time", "Contract", "Full-time", "Full-time"]
EXP_LEVELS = ["Mid-Senior level", "Associate", "Entry level", "Director", "Executive"]
EDU_LEVELS = ["Bachelor's Degree", "Master's Degree", "High School or equivalent", "Unspecified"]
INDUSTRIES = ["Computer Software", "Financial Services", "Information Technology", "Healthcare", "Marketing & Advertising"]

def generate_dataset(output_path="dataset/demo_dataset.csv", total_rows=300, fraud_ratio=0.05):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    num_fraud = int(total_rows * fraud_ratio)
    num_genuine = total_rows - num_fraud

    rows = []
    job_id = 1

    # Generate Genuine Postings
    for _ in range(num_genuine):
        row = {
            "job_id": job_id,
            "title": random.choice(GENUINE_TITLES),
            "location": random.choice(LOCATIONS),
            "department": random.choice(["Engineering", "Data Science", "Product", "Operations", "Marketing", "HR"]),
            "salary_range": random.choice(SALARIES),
            "company_profile": random.choice(GENUINE_COMPANIES),
            "description": random.choice(GENUINE_DESCRIPTIONS),
            "requirements": random.choice(GENUINE_REQUIREMENTS),
            "benefits": random.choice(GENUINE_BENEFITS),
            "telecommuting": random.choice([0, 1]),
            "has_company_logo": 1,
            "has_questions": random.choice([0, 1]),
            "employment_type": random.choice(EMP_TYPES),
            "required_experience": random.choice(EXP_LEVELS),
            "required_education": random.choice(EDU_LEVELS),
            "industry": random.choice(INDUSTRIES),
            "function": random.choice(["Engineering", "Information Technology", "Design", "Management"]),
            "fraudulent": 0
        }
        rows.append(row)
        job_id += 1

    # Generate Fraudulent Postings
    for _ in range(num_fraud):
        row = {
            "job_id": job_id,
            "title": random.choice(SUSPICIOUS_TITLES),
            "location": random.choice(LOCATIONS),
            "department": random.choice(["Work From Home", "Payment Processing", "Customer Care", ""]),
            "salary_range": random.choice(SUSPICIOUS_SALARIES),
            "company_profile": random.choice(["Quick money opportunities.", "Offshore financial team.", "Global fast hiring firm.", ""]),
            "description": random.choice(SUSPICIOUS_DESCRIPTIONS),
            "requirements": random.choice(SUSPICIOUS_REQUIREMENTS),
            "benefits": random.choice(SUSPICIOUS_BENEFITS),
            "telecommuting": 1,
            "has_company_logo": 0,
            "has_questions": 0,
            "employment_type": random.choice(["Part-time", "Contract", "Other"]),
            "required_experience": "Entry level",
            "required_education": "High School or equivalent",
            "industry": "Customer Service",
            "function": "Financial",
            "fraudulent": 1
        }
        rows.append(row)
        job_id += 1

    random.shuffle(rows)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=HEADERS)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated synthetic demo dataset with {len(rows)} rows ({num_fraud} fraudulent, {num_genuine} genuine) at {output_path}")

if __name__ == "__main__":
    generate_dataset()
