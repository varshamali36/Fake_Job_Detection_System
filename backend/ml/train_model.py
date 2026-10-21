import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timezone

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# Add backend directory to path if needed for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ml.preprocess import combine_fields

def train_pipeline():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    ml_dir = os.path.abspath(os.path.dirname(__file__))

    full_dataset_path = os.path.join(base_dir, "dataset", "fake_job_postings.csv")
    demo_dataset_path = os.path.join(base_dir, "dataset", "demo_dataset.csv")

    if os.path.exists(full_dataset_path):
        dataset_path = full_dataset_path
        dataset_name = "fake_job_postings.csv"
        print(f"[INFO] Using full dataset at: {dataset_path}")
    elif os.path.exists(demo_dataset_path):
        dataset_path = demo_dataset_path
        dataset_name = "demo_dataset.csv"
        print("=" * 75)
        print("LOUD WARNING: 'fake_job_postings.csv' was NOT found in dataset/.")
        print("Using synthetic demo dataset: dataset/demo_dataset.csv")
        print("This dataset is generated for demo and testing purposes ONLY.")
        print("=" * 75)
    else:
        raise FileNotFoundError("Neither dataset/fake_job_postings.csv nor dataset/demo_dataset.csv could be found!")

    # Load dataset
    df = pd.read_csv(dataset_path)
    total_rows = len(df)

    if total_rows < 10 and dataset_path == full_dataset_path and os.path.exists(demo_dataset_path):
        print(f"[INFO] '{dataset_name}' contains only {total_rows} rows. Falling back to demo_dataset.csv for training.")
        dataset_path = demo_dataset_path
        dataset_name = "demo_dataset.csv"
        df = pd.read_csv(dataset_path)
        total_rows = len(df)

    print(f"[INFO] Loaded {total_rows} rows from {dataset_name}.")

    # Preprocess text
    print("[INFO] Combining and preprocessing text fields...")
    X_text = df.apply(combine_fields, axis=1)
    y = df['fraudulent'].astype(int)

    # Train/Test Split (80/20)
    # Check if stratify is possible (minimum 2 samples per class)
    class_counts = y.value_counts()
    use_stratify = y if (len(class_counts) > 1 and class_counts.min() >= 2) else None

    X_train_text, X_test_text, y_train, y_test = train_test_split(
        X_text, y, test_size=0.20, random_state=42, stratify=use_stratify
    )
    print(f"[INFO] Training set size: {len(X_train_text)}, Test set size: {len(X_test_text)}")

    # Vectorization
    print("[INFO] Vectorizing text using TF-IDF...")
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), min_df=1)
    X_train_vec = vectorizer.fit_transform(X_train_text)
    X_test_vec = vectorizer.transform(X_test_text)

    # 1. Logistic Regression (Primary Candidate)
    print("[INFO] Training Logistic Regression model...")
    lr_model = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
    lr_model.fit(X_train_vec, y_train)
    y_pred_lr = lr_model.predict(X_test_vec)

    lr_metrics = {
        "accuracy": round(float(accuracy_score(y_test, y_pred_lr)), 4),
        "precision": round(float(precision_score(y_test, y_pred_lr, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred_lr, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, y_pred_lr, zero_division=0)), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred_lr).tolist()
    }

    # 2. Random Forest (Comparison Candidate)
    print("[INFO] Training Random Forest Classifier...")
    rf_model = RandomForestClassifier(class_weight='balanced', n_estimators=100, random_state=42)
    rf_model.fit(X_train_vec, y_train)
    y_pred_rf = rf_model.predict(X_test_vec)

    rf_metrics = {
        "accuracy": round(float(accuracy_score(y_test, y_pred_rf)), 4),
        "precision": round(float(precision_score(y_test, y_pred_rf, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred_rf, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, y_pred_rf, zero_division=0)), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred_rf).tolist()
    }

    # Model Selection Strategy: Pick higher F1 score (fallback to Logistic Regression if equal)
    if rf_metrics["f1_score"] > lr_metrics["f1_score"]:
        winning_name = "RandomForest"
        winning_model = rf_model
    else:
        winning_name = "LogisticRegression"
        winning_model = lr_model

    # Print Console Comparison Table
    print("\n" + "=" * 65)
    print(f"{'MODEL COMPARISON SUMMARY':^65}")
    print("=" * 65)
    print(f"{'Metric':<20} | {'Logistic Regression':<18} | {'Random Forest':<18}")
    print("-" * 65)
    print(f"{'Accuracy':<20} | {lr_metrics['accuracy']:<18} | {rf_metrics['accuracy']:<18}")
    print(f"{'Precision':<20} | {lr_metrics['precision']:<18} | {rf_metrics['precision']:<18}")
    print(f"{'Recall':<20} | {lr_metrics['recall']:<18} | {rf_metrics['recall']:<18}")
    print(f"{'F1 Score':<20} | {lr_metrics['f1_score']:<18} | {rf_metrics['f1_score']:<18}")
    print("=" * 65)
    print(f"Selected Primary Model: {winning_name} (F1 Score: {lr_metrics['f1_score'] if winning_name == 'LogisticRegression' else rf_metrics['f1_score']})")
    print("=" * 65 + "\n")

    # Serialize Artifacts
    model_path = os.path.join(ml_dir, "model.pkl")
    vectorizer_path = os.path.join(ml_dir, "vectorizer.pkl")
    metrics_path = os.path.join(ml_dir, "metrics.json")

    joblib.dump(winning_model, model_path)
    joblib.dump(vectorizer, vectorizer_path)

    metrics_data = {
        "dataset_name": dataset_name,
        "total_rows": total_rows,
        "training_timestamp": datetime.now(timezone.utc).isoformat(),
        "primary_model": winning_name,
        "logistic_regression": lr_metrics,
        "random_forest": rf_metrics
    }

    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)

    print(f"[SUCCESS] Saved model to {model_path}")
    print(f"[SUCCESS] Saved vectorizer to {vectorizer_path}")
    print(f"[SUCCESS] Saved metrics to {metrics_path}")

if __name__ == "__main__":
    train_pipeline()
