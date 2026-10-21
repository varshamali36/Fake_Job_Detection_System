import io
import pytest

def test_upload_wrong_file_extension(auth_client_admin):
    res = auth_client_admin.post(
        '/api/admin/upload-dataset',
        data={'file': (io.BytesIO(b"dummy text"), 'data.txt')},
        content_type='multipart/form-data'
    )
    assert res.status_code == 400
    assert "Only CSV files" in res.get_json()["error"]

def test_upload_missing_required_column(auth_client_admin):
    csv_content = "title,description\nSoftware Dev,Python coding"
    res = auth_client_admin.post(
        '/api/admin/upload-dataset',
        data={'file': (io.BytesIO(csv_content.encode('utf-8')), 'test.csv')},
        content_type='multipart/form-data'
    )
    assert res.status_code == 400
    err_msg = res.get_json()["error"]
    assert "Required columns are missing" in err_msg

def test_upload_valid_csv(auth_client_admin):
    valid_csv = "title,description,fraudulent,company_profile,requirements,benefits,employment_type,required_experience,required_education,industry,function\n" \
                "Software Engineer,Python dev,0,Company,Reqs,Ben,Full-time,Mid,Bachelor,Tech,Eng\n" \
                "Scam Data Entry,Wire money,1,Fake,None,Cash,Part-time,Entry,None,Customer,Finance"
    res = auth_client_admin.post(
        '/api/admin/upload-dataset',
        data={'file': (io.BytesIO(valid_csv.encode('utf-8')), 'valid.csv')},
        content_type='multipart/form-data'
    )
    assert res.status_code == 200
    data = res.get_json()
    assert data["row_count"] == 2
    assert "train_model.py" in data["retrain_command"]
