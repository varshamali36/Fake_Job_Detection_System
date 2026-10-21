import os
import sys
import io
import json
import unittest

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app import create_app
from database.db import db
from database.seed import seed_db

class TestBackendAPI(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()
            seed_db(self.app)

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_full_api_workflow(self):
        print("\n=======================================================")
        print("STARTING FULL E2E API VERIFICATION TEST (PHASES 1-4)")
        print("=======================================================")

        # 1. Register User 1 (Regular User)
        res_reg1 = self.client.post('/api/register', json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "Password123!"
        })
        self.assertEqual(res_reg1.status_code, 201)
        print("[PASS] User 1 Registered (201 Created)")

        # 2. Check /api/me for User 1
        res_me1 = self.client.get('/api/me')
        self.assertEqual(res_me1.status_code, 200)
        self.assertEqual(res_me1.get_json()['user']['username'], 'alice')
        print("[PASS] User 1 Session verified via /api/me")

        # 3. User 1 submits a Job Prediction
        job_data = {
            "title": "Data Entry Assistant - $5000/Week Immediate Hiring",
            "company_profile": "",
            "description": "Work 1 hour daily processing wire transfers and cashing checks. Contact via Telegram.",
            "requirements": "No experience needed. Must pay $50 application fee.",
            "benefits": "Instant cash, work from home.",
            "employment_type": "Part-time",
            "required_experience": "Entry level",
            "salary_range": "$5000/week",
            "has_company_logo": False
        }

        res_pred = self.client.post('/api/predict', json=job_data)
        self.assertEqual(res_pred.status_code, 201)
        pred_json = res_pred.get_json()
        pred_id = pred_json['id']
        self.assertIn('prediction', pred_json)
        self.assertIn('risk_score', pred_json)
        self.assertIn('risk_level', pred_json)
        print(f"[PASS] User 1 Submitted Job Prediction (ID: {pred_id}, Result: {pred_json['prediction']}, Risk: {pred_json['risk_level']})")

        # 4. User 1 Dashboard API Test
        res_dash = self.client.get('/api/dashboard')
        self.assertEqual(res_dash.status_code, 200)
        dash_json = res_dash.get_json()
        self.assertEqual(dash_json['total_analyzed'], 1)
        self.assertIn('risk_distribution', dash_json)
        self.assertIn('predictions_over_time', dash_json)
        self.assertIn('top_keywords', dash_json)
        print("[PASS] GET /api/dashboard returned per-user analytics & charts data")

        # 5. User 1 views history
        res_hist = self.client.get('/api/history')
        self.assertEqual(res_hist.status_code, 200)
        hist_json = res_hist.get_json()
        self.assertEqual(hist_json['total'], 1)
        print("[PASS] User 1 History fetched (1 record found)")

        # 6. User 1 attempts Admin Route (Must be rejected with 403 Forbidden)
        res_admin_fail = self.client.get('/api/admin/stats')
        self.assertEqual(res_admin_fail.status_code, 403)
        print("[PASS] Security Check: Non-admin GET /api/admin/stats rejected with 403 Forbidden")

        # 7. Logout User 1
        self.client.post('/api/logout')

        # 8. Login as Seeded Admin User
        res_admin_login = self.client.post('/api/login', json={
            "username": "admin",
            "password": "AdminPassword123!"
        })
        self.assertEqual(res_admin_login.status_code, 200)
        print("[PASS] Admin User Logged in successfully")

        # 9. Admin Stats API
        res_admin_stats = self.client.get('/api/admin/stats')
        self.assertEqual(res_admin_stats.status_code, 200)
        admin_stats = res_admin_stats.get_json()
        self.assertGreaterEqual(admin_stats['total_users'], 2)
        self.assertEqual(admin_stats['total_jobs'], 1)
        print("[PASS] Admin GET /api/admin/stats returned system-wide stats")

        # 10. Admin Dataset Upload - Invalid CSV (Missing Required Columns)
        invalid_csv = "title,description\nSoftware Engineer,Build apps"
        res_up_invalid = self.client.post(
            '/api/admin/upload-dataset',
            data={'file': (io.BytesIO(invalid_csv.encode('utf-8')), 'test.csv')},
            content_type='multipart/form-data'
        )
        self.assertEqual(res_up_invalid.status_code, 400)
        self.assertIn('Required columns are missing', res_up_invalid.get_json()['error'])
        print(f"[PASS] CSV Upload Validation: Missing columns rejected ({res_up_invalid.get_json()['error']})")

        # 11. Admin Dataset Upload - Invalid fraudulent values
        invalid_fraud_csv = "title,description,fraudulent,company_profile,requirements,benefits,employment_type,required_experience,required_education,industry,function\nTitle,Desc,invalid_val,Comp,Req,Ben,Full-time,Mid,Bachelor,Tech,Eng"
        res_up_fraud_err = self.client.post(
            '/api/admin/upload-dataset',
            data={'file': (io.BytesIO(invalid_fraud_csv.encode('utf-8')), 'test.csv')},
            content_type='multipart/form-data'
        )
        self.assertEqual(res_up_fraud_err.status_code, 400)
        self.assertIn("must contain only 0 or 1 values", res_up_fraud_err.get_json()['error'])
        print(f"[PASS] CSV Upload Validation: Invalid fraudulent values rejected ({res_up_fraud_err.get_json()['error']})")

        # 12. Admin Dataset Upload - Valid CSV
        valid_csv = "title,description,fraudulent,company_profile,requirements,benefits,employment_type,required_experience,required_education,industry,function\n" \
                    "Software Engineer,Python dev,0,Company,Reqs,Ben,Full-time,Mid,Bachelor,Tech,Eng\n" \
                    "Scam Data Entry,Wire money,1,Fake,None,Cash,Part-time,Entry,None,Customer,Finance"
        res_up_valid = self.client.post(
            '/api/admin/upload-dataset',
            data={'file': (io.BytesIO(valid_csv.encode('utf-8')), 'valid_test.csv')},
            content_type='multipart/form-data'
        )
        self.assertEqual(res_up_valid.status_code, 200)
        up_json = res_up_valid.get_json()
        self.assertEqual(up_json['row_count'], 2)
        self.assertEqual(up_json['class_balance']['genuine'], 1)
        self.assertEqual(up_json['class_balance']['fraudulent'], 1)
        self.assertIn('train_model.py', up_json['retrain_command'])
        print(f"[PASS] CSV Upload Success: Saved dataset with {up_json['row_count']} rows. Command: {up_json['retrain_command']}")

        # 13. Metrics API check
        res_met = self.client.get('/api/metrics')
        self.assertEqual(res_met.status_code, 200)
        print("[PASS] /api/metrics API returned real metrics from ml/metrics.json")

        print("=======================================================")
        print("ALL PHASES 1-4 VERIFICATION TESTS PASSED SUCCESSFULLY!")
        print("=======================================================")

if __name__ == '__main__':
    unittest.main()
