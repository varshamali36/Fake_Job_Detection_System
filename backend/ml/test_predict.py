import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ml.predict import predict

def test_inference():
    genuine_job = {
        "title": "Senior Software Engineer - Python & Distributed Systems",
        "company_profile": "Acme Corp is a world-class technology company providing cloud scalable microservices.",
        "description": "We are seeking a senior backend software engineer with strong experience in Python, Flask, Docker, and PostgreSQL. You will design REST APIs and high-throughput background queues.",
        "requirements": "Bachelor's degree in Computer Science, 5+ years experience in Python, knowledge of Git, CI/CD, and relational databases.",
        "benefits": "Competitive market salary, health & dental insurance, 401k match, 25 days PTO.",
        "has_company_logo": 1,
        "employment_type": "Full-time"
    }

    scam_job = {
        "title": "Data Entry Clerk - Earn $5000/Week - Immediate Hiring",
        "company_profile": "Offshore financial team offering quick online earnings.",
        "description": "Earn massive income from home! Work 1 hour per day processing wire transfers and handling customer checks. Contact us via Telegram or WhatsApp immediately.",
        "requirements": "No experience needed. Must pay $50 registration fee for application processing. Personal bank account required.",
        "benefits": "Instant cash pay, work 1 hour a day, $1000 daily bonuses.",
        "has_company_logo": 0,
        "employment_type": "Part-time"
    }

    res_genuine = predict(genuine_job)
    res_scam = predict(scam_job)

    print("\n--- TEST RESULT: GENUINE JOB ---")
    print(f"Prediction       : {res_genuine['prediction']}")
    print(f"Confidence Score : {res_genuine['confidence_score']}%")
    print(f"Probabilities    : {res_genuine['probabilities']}")

    print("\n--- TEST RESULT: SCAM JOB ---")
    print(f"Prediction       : {res_scam['prediction']}")
    print(f"Confidence Score : {res_scam['confidence_score']}%")
    print(f"Probabilities    : {res_scam['probabilities']}")

if __name__ == "__main__":
    test_inference()
