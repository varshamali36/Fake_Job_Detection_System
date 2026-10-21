import pytest

def test_predict_unauthenticated(client):
    res = client.post('/api/predict', json={
        "title": "Software Engineer",
        "description": "Develop Python software applications."
    })
    assert res.status_code == 401
    assert "Authentication required" in res.get_json()["error"]

def test_predict_missing_description(auth_client_alice):
    res = auth_client_alice.post('/api/predict', json={
        "title": "Software Engineer",
        "description": ""
    })
    assert res.status_code == 400
    assert "Description is required" in res.get_json()["error"]

def test_predict_valid_genuine_job(auth_client_alice):
    job_payload = {
        "title": "Senior Python Full Stack Engineer",
        "company_profile": "Acme Software Corp is an enterprise technology provider.",
        "description": "Seeking an experienced engineer to build microservices using Python, Flask, and React.",
        "requirements": "Bachelor degree in CS, 4+ years Python experience.",
        "benefits": "Health insurance, 401k match, 25 days PTO.",
        "employment_type": "Full-time",
        "required_experience": "Mid-Senior level",
        "has_company_logo": True
    }
    res = auth_client_alice.post('/api/predict', json=job_payload)
    assert res.status_code == 201
    data = res.get_json()
    assert "prediction" in data
    assert "risk_score" in data
    assert "risk_level" in data
    assert data["prediction"] in ["Genuine", "Suspicious"]
