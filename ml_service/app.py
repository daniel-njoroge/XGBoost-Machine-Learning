from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
import json
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app)

# Load the model and feature importance on startup
MODEL_PATH = "ml_service/models/delay_prediction_v1.joblib"
IMPORTANCE_PATH = "ml_service/models/feature_importance.json"

pipeline = None
feature_importance = {}

if os.path.exists(MODEL_PATH):
    pipeline = joblib.load(MODEL_PATH)
    print(f"Model loaded from {MODEL_PATH}")
else:
    print(f"Error: Model not found at {MODEL_PATH}")

if os.path.exists(IMPORTANCE_PATH):
    with open(IMPORTANCE_PATH, 'r') as f:
        feature_importance = json.load(f)
    print(f"Feature importance loaded from {IMPORTANCE_PATH}")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "model_loaded": pipeline is not None,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }), 200

@app.route("/predict", methods=["POST"])
def predict():
    if pipeline is None:
        return jsonify({"error": "Model not loaded"}), 503
    
    data = request.get_json()
    if not data or "features" not in data:
        return jsonify({"error": "Request must contain 'features' object"}), 422
    
    # Input features
    features = data["features"]
    
    # Mapping and validation
    required_fields = [
        'Task_Duration_Days', 'Labor_Required', 'Equipment_Units', 
        'Material_Cost_KSH', 'Start_Constraint', 'Risk_Level',
        'Resource_Constraint_Score', 'Site_Constraint_Score', 'Dependency_Count'
    ]
    
    missing = [f for f in required_fields if f not in features]
    if missing:
        return jsonify({"error": f"Missing features: {missing}"}), 422
    
    # Map KSH to USD for internal model compatibility
    features['Material_Cost_USD'] = features.pop('Material_Cost_KSH')
    
    # Explicit column order expected by the model
    model_features = [
        'Task_Duration_Days', 'Labor_Required', 'Equipment_Units', 
        'Material_Cost_USD', 'Start_Constraint', 'Risk_Level',
        'Resource_Constraint_Score', 'Site_Constraint_Score', 'Dependency_Count'
    ]
    
    # Prepare DataFrame with explicit column order
    try:
        input_df = pd.DataFrame([features])[model_features]
        
        prediction = pipeline.predict(input_df)[0]

        risk_prob = 1 / (1 + np.exp(-(prediction - 10) / 5))
        
        return jsonify({
            "predicted_delay_days": round(float(prediction), 1),
            "delay_probability": round(float(risk_prob), 3),
            "risk_factors": feature_importance,
            "predicted_at": datetime.now(timezone.utc).isoformat(),
            "model_version": "xgboost-delay-v1.0.0"
        }), 200
        
    except Exception as e:
        print(f"Prediction Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Delay Prediction Service on port {port}...")
    app.run(host="0.0.0.0", port=port)
