import joblib
import pandas as pd
import numpy as np
import json
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def show_full_metrics():
    model_path = "ml_service/models/delay_prediction_v1.joblib"
    data_path = "ml_service/prepared_construction_data_v2.csv"
    importance_path = "ml_service/models/feature_importance.json"

    print("=" * 60)
    print("AI MODEL PERFORMANCE METRICS")
    print("=" * 60)

    try:
        pipeline = joblib.load(model_path)
        df = pd.read_csv(data_path)
    except Exception as e:
        print(f"Error loading model or data: {e}")
        return

    # 1. Performance Evaluation
    FEATURES = [
        'Task_Duration_Days', 'Labor_Required', 'Equipment_Units',
        'Material_Cost_USD', 'Start_Constraint',
        'Risk_Level', 'Resource_Constraint_Score', 'Site_Constraint_Score',
        'Dependency_Count'
    ]
    X = df[FEATURES]
    y = df['Delay_Days']
    
    y_pred = pipeline.predict(X)
    
    mae = mean_absolute_error(y, y_pred)
    mse = mean_squared_error(y, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y, y_pred)

    print(f"{'Metric':<25} | {'Value':<20}")
    print("-" * 60)
    print(f"{'Mean Absolute Error':<25} | {mae:<20.4f} days")
    print(f"{'Mean Squared Error':<25} | {mse:<20.4f}")
    print(f"{'Root Mean Squared Error':<25} | {rmse:<20.4f} days")
    print(f"{'R-Squared (Accuracy)':<25} | {r2:<20.4f}")
    print("\n")

    # 2. Feature Importance
    print("TOP DELAY PREDICTORS (Feature Importance)")
    print("-" * 60)
    try:
        with open(importance_path, 'r') as f:
            importance = json.load(f)
        
        # Sort and show
        sorted_importance = sorted(importance.items(), key=lambda x: x[1], reverse=True)
        print(f"{'Factor':<25} | {'Relative Impact':<20}")
        print("-" * 60)
        for factor, weight in sorted_importance[:8]:
            print(f"{factor:<25} | {weight:<20.4f}")
    except:
        print("Feature importance data not found.")

    print("=" * 60)

if __name__ == "__main__":
    show_full_metrics()
