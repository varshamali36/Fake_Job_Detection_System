import pytest

def test_register_success(client):
    res = client.post('/api/register', json={
        "username": "charlie",
        "email": "charlie@test.com",
        "password": "Password123!"
    })
    assert res.status_code == 201
    json_data = res.get_json()
    assert "user" in json_data
    assert json_data["user"]["username"] == "charlie"
    assert "password_hash" not in json_data["user"]

def test_register_duplicate_username(client):
    res = client.post('/api/register', json={
        "username": "alice",
        "email": "new_alice@test.com",
        "password": "Password123!"
    })
    assert res.status_code == 409
    assert "already exists" in res.get_json()["error"]

def test_register_duplicate_email(client):
    res = client.post('/api/register', json={
        "username": "new_user",
        "email": "alice@test.com",
        "password": "Password123!"
    })
    assert res.status_code == 409
    assert "already exists" in res.get_json()["error"]

def test_register_short_password(client):
    res = client.post('/api/register', json={
        "username": "david",
        "email": "david@test.com",
        "password": "short"
    })
    assert res.status_code == 400
    assert "at least 8 characters" in res.get_json()["error"]

def test_login_success(client):
    res = client.post('/api/login', json={
        "username": "alice",
        "password": "Password123!"
    })
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["user"]["username"] == "alice"
    assert "password_hash" not in json_data["user"]

def test_login_invalid_password(client):
    res = client.post('/api/login', json={
        "username": "alice",
        "password": "WrongPassword!"
    })
    assert res.status_code == 401
    assert "Invalid username/email or password" in res.get_json()["error"]
