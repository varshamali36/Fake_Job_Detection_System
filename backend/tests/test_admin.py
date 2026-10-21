import pytest

def test_admin_route_forbidden_for_regular_user(auth_client_alice):
    res = auth_client_alice.get('/api/admin/stats')
    assert res.status_code == 403
    assert "Forbidden" in res.get_json()["error"]

def test_admin_route_success_for_admin(auth_client_admin):
    res = auth_client_admin.get('/api/admin/stats')
    assert res.status_code == 200
    data = res.get_json()
    assert "total_users" in data
    assert "total_jobs" in data
