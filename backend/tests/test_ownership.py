import pytest

def test_user_ownership_isolation(app):
    # 1. Alice creates a job prediction
    with app.test_client() as client_alice:
        res_login_a = client_alice.post('/api/login', json={"username": "alice", "password": "Password123!"})
        assert res_login_a.status_code == 200

        job_payload = {
            "title": "Alice Confidential Job",
            "description": "Internal developer opening."
        }
        res_alice_pred = client_alice.post('/api/predict', json=job_payload)
        assert res_alice_pred.status_code == 201
        pred_id = res_alice_pred.get_json()["id"]

    # 2. Bob attempts to access Alice's prediction -> MUST get 403 Forbidden
    with app.test_client() as client_bob:
        res_login_b = client_bob.post('/api/login', json={"username": "bob", "password": "Password123!"})
        assert res_login_b.status_code == 200

        res_bob_get = client_bob.get(f'/api/history/{pred_id}')
        assert res_bob_get.status_code == 403
        assert "Forbidden" in res_bob_get.get_json()["error"]

        res_bob_del = client_bob.delete(f'/api/history/{pred_id}')
        assert res_bob_del.status_code == 403
        assert "Forbidden" in res_bob_del.get_json()["error"]

    # 3. Alice accesses her own prediction -> MUST succeed 200 OK
    with app.test_client() as client_alice_2:
        client_alice_2.post('/api/login', json={"username": "alice", "password": "Password123!"})
        res_alice_get = client_alice_2.get(f'/api/history/{pred_id}')
        assert res_alice_get.status_code == 200
        assert res_alice_get.get_json()["job_posting"]["title"] == "Alice Confidential Job"
