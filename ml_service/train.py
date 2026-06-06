import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import os
import shap

def train_model(data_path, model_dir):
    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)

    FEATURES = [
        'Task_Duration_Days',
        'Labor_Required',
        'Equipment_Units',
        'Material_Cost_USD',
        'Start_Constraint',
        'Risk_Level',
        'Resource_Constraint_Score',
        'Site_Constraint_Score',
        'Dependency_Count'
    ]
    
    TARGET = 'Delay_Days'
    
    X = df[FEATURES]
    y = df[TARGET]
    
    # Preprocessing
    numeric_features = ['Task_Duration_Days', 'Labor_Required', 'Equipment_Units', 'Material_Cost_USD', 
                        'Start_Constraint', 'Resource_Constraint_Score', 'Site_Constraint_Score', 'Dependency_Count']
    categorical_features = ['Risk_Level']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ]
    )
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', xgb.XGBRegressor(
            n_estimators=1000,
            learning_rate=0.05,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        ))
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost model...")
    pipeline.fit(X_train, y_train)
    

    y_pred = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Model Training Complete!")
    print(f"MAE: {mae:.2f} days")
    print(f"R2 Score: {r2:.4f}")
    
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "delay_prediction_v1.joblib")
    joblib.dump(pipeline, model_path)
    print(f"Model saved to {model_path}")
    
    # SHAP Explainability
    print("Generating SHAP feature importance...")

    ohe_categories = pipeline.named_steps['preprocessor'].named_transformers_['cat'].categories_[0]
    feature_names = numeric_features + [f"Risk_{c}" for c in ohe_categories]
    
    explainer = shap.Explainer(pipeline.named_steps['regressor'])
    X_train_transformed = pipeline.named_steps['preprocessor'].transform(X_train)
    shap_values = explainer(X_train_transformed)
    
    importance = np.abs(shap_values.values).mean(axis=0)
    feat_importance = dict(zip(feature_names, importance.tolist()))
    
    importance_path = os.path.join(model_dir, "feature_importance.json")
    import json
    with open(importance_path, 'w') as f:
        json.dump(feat_importance, f)
    print(f"Feature importance saved to {importance_path}")

if __name__ == "__main__":
    data_file = "ml_service/prepared_construction_data_v2.csv"
    model_directory = "ml_service/models"
    
    if os.path.exists(data_file):
        train_model(data_file, model_directory)
    else:
        print(f"Error: Prepared data not found at {data_file}")
