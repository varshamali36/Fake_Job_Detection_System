import os
import sys
import joblib

# Add backend directory to path if needed for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ml.preprocess import combine_fields

class ModelMissingError(Exception):
    """Custom exception raised when model.pkl or vectorizer.pkl is missing from disk."""
    pass

_MODEL = None
_VECTORIZER = None

def _load_artifacts():
    global _MODEL, _VECTORIZER
    if _MODEL is not None and _VECTORIZER is not None:
        return

    ml_dir = os.path.abspath(os.path.dirname(__file__))
    model_path = os.path.join(ml_dir, "model.pkl")
    vectorizer_path = os.path.join(ml_dir, "vectorizer.pkl")

    if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
        raise ModelMissingError(
            f"Trained model artifacts missing! Please run `python backend/ml/train_model.py` to generate model.pkl and vectorizer.pkl."
        )

    try:
        _MODEL = joblib.load(model_path)
        _VECTORIZER = joblib.load(vectorizer_path)
    except Exception as e:
        raise ModelMissingError(f"Failed to load ML artifacts from disk: {str(e)}")

def predict(job_dict: dict) -> dict:
    """
    Evaluates a job dictionary using the loaded ML model.
    Returns prediction ('Genuine' or 'Suspicious'), confidence score, and class probabilities.
    """
    _load_artifacts()

    # Combine and clean text fields
    processed_text = combine_fields(job_dict)

    if not processed_text.strip():
        # Fallback if no text provided
        return {
            "prediction": "Suspicious",
            "confidence_score": 50.0,
            "probabilities": {"genuine": 0.5, "suspicious": 0.5},
            "raw_fake_prob": 0.5
        }

    # Transform text feature
    vec = _VECTORIZER.transform([processed_text])

    # Predict class and probabilities
    probs = _MODEL.predict_proba(vec)[0]
    classes = list(_MODEL.classes_)

    # Probability of class 1 (fraudulent) vs class 0 (genuine)
    fake_idx = classes.index(1) if 1 in classes else 1
    genuine_idx = classes.index(0) if 0 in classes else 0

    fake_prob = float(probs[fake_idx])
    genuine_prob = float(probs[genuine_idx])

    # Prediction label
    if fake_prob >= 0.5:
        prediction_label = "Suspicious"
        confidence = fake_prob * 100.0
    else:
        prediction_label = "Genuine"
        confidence = genuine_prob * 100.0

    return {
        "prediction": prediction_label,
        "confidence_score": round(confidence, 2),
        "probabilities": {
            "genuine": round(genuine_prob, 4),
            "suspicious": round(fake_prob, 4)
        },
        "raw_fake_prob": fake_prob
    }
