import joblib
import pandas as pd
import numpy as np

def test_model():
    model_path = "ml_service/models/delay_prediction_v1.joblib"
    try:
        pipeline = joblib.load(model_path)
    except:
        print("Model not found. Run train.py first.")
        return

    # Define test scenarios
    scenarios = [
        {
            "name": "Standard Task (Low Pressure)",
            "data": {
                'Task_Duration_Days': 10,
                'Labor_Required': 5,
                'Equipment_Units': 2,
                'Material_Cost_KSH': 50000,
                'Material_Cost_USD': 380,
                'Start_Constraint': 0,
                'Risk_Level': 'Low',
                'Resource_Constraint_Score': 0.2,
                'Site_Constraint_Score': 0.1,
                'Dependency_Count': 0
            }
        },
        {
            "name": "High Resource Pressure",
            "data": {
                'Task_Duration_Days': 10,
                'Labor_Required': 15,
                'Equipment_Units': 5,
                'Material_Cost_KSH': 50000,
                'Material_Cost_USD': 380,
                'Start_Constraint': 0,
                'Risk_Level': 'Low',
                'Resource_Constraint_Score': 0.8,
                'Site_Constraint_Score': 0.2,
                'Dependency_Count': 0
            }
        },
        {
            "name": "Complex Dependencies & Site Issues",
            "data": {
                'Task_Duration_Days': 10,
                'Labor_Required': 5,
                'Equipment_Units': 2,
                'Material_Cost_KSH': 50000,
                'Material_Cost_USD': 380,
                'Start_Constraint': 5,
                'Risk_Level': 'High',
                'Resource_Constraint_Score': 0.3,
                'Site_Constraint_Score': 0.9,
                'Dependency_Count': 4
            }
        }
    ]

    print(f"{'Scenario':<35} | {'Predicted Delay (Days)':<25}")
    print("-" * 65)
    
    for s in scenarios:
        df = pd.DataFrame([s['data']])
        prediction = pipeline.predict(df)[0]
        print(f"{s['name']:<35} | {prediction:<25.2f}")

if __name__ == "__main__":
    test_model()
