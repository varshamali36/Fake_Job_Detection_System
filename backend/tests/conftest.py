import os
import sys
import pytest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from database.db import db
from database.seed import seed_db
from models.user import User

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "WTF_CSRF_ENABLED": False,
        "SECRET_KEY": "test-secret-key-12345"
    })

    with app.app_context():
        db.create_all()
        seed_db(app)

        # Create regular test users
        user1 = User(username="alice", email="alice@test.com", role="user")
        user1.set_password("Password123!")
        db.session.add(user1)

        user2 = User(username="bob", email="bob@test.com", role="user")
        user2.set_password("Password123!")
        db.session.add(user2)

        db.session.commit()

        yield app

        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_client_alice(app):
    c = app.test_client()
    c.post('/api/login', json={"username": "alice", "password": "Password123!"})
    return c

@pytest.fixture
def auth_client_bob(app):
    c = app.test_client()
    c.post('/api/login', json={"username": "bob", "password": "Password123!"})
    return c

@pytest.fixture
def auth_client_admin(app):
    c = app.test_client()
    c.post('/api/login', json={"username": "admin", "password": "AdminPassword123!"})
    return c
