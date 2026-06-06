# XGBoost Model in a Construction Project Management App

A construction project management system with a React Native Expo mobile application and a Python-based machine learning service.

## Overview

This repository contains two main parts:

1. **`ProjectApp/`** - A React Native Expo application for construction project managers and supervisors.
2. **`ml_service/`** - A Python Flask service for construction delay prediction and training.

## Key Features

### Mobile App

- Role-based access for **Managers** and **Supervisors**
- Authentication via **Login** and **SignUp** flows
- **Project selection** and **project join** functionality
- Manager dashboard with:
  - Project creation and editing
  - Task management and creation
  - Attendance logs
  - Incidents and material usage logs
  - Document management
  - Equipment tracking
  - Risk analytics and model status views
- Supervisor dashboard with:
  - Daily logs
  - Task lists
  - Incident reporting
  - Document uploads
  - Barcode/QR scanning for attendance or check-in
- Shared project views such as materials and project gallery
- Theme support via custom `useTheme` hook and navigation theme integration

### Machine Learning Service

- Flask-based API server providing delay prediction
- Prediction endpoint accepts structured task feature input and returns:
  - `predicted_delay_days`
  - `delay_probability`
  - `risk_factors`
  - `predicted_at`
  - `model_version`
- Training script for an XGBoost delay prediction model using prepared construction data
- SHAP-based feature importance export

## Repository Structure

```
Project App/
├─ ProjectApp/          # React Native Expo app
│  ├─ App.tsx
│  ├─ app.json
│  ├─ index.ts
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ store.ts
│  ├─ assets/
│  └─ src/
│     ├─ screens/
│     │  ├─ auth/
│     │  ├─ common/
│     │  ├─ manager/
│     │  └─ supervisor/
│     ├─ hooks/
│     ├─ theme/
│     └─ utils/
└─ ml_service/          # Python ML service and training pipeline
   ├─ app.py
   ├─ train.py
   ├─ prepare_data.py
   ├─ model_metrics.py
   ├─ test_inference.py
   ├─ prepared_construction_data_v2.csv
   └─ models/
      ├─ delay_prediction_v1.joblib
      └─ feature_importance.json
```

## Getting Started

### Mobile App Setup

1. Open a terminal inside `ProjectApp/`
2. Install dependencies:

```bash
npm install
```

3. Start Expo:

```bash
npm start
```

4. Run on your target platform:

- Android: `npm run android`
- iOS: `npm run ios`
- Web: `npm run web`

### ML Service Setup

1. Open a terminal inside `ml_service/`
2. Create and activate a Python virtual environment:

```bash
python -m venv venv
.\venv\Scripts\Activate.ps1  # PowerShell
```

3. Install required packages:

```bash
pip install flask flask-cors pandas numpy scikit-learn xgboost shap joblib
```

4. Run the Flask API:

```bash
python app.py
```

5. Train the delay prediction model:

```bash
python train.py
```

## ML API Endpoints

### Health Check

- `GET /health`
- Response indicates whether the model is loaded and the service is online

### Predict Delay

- `POST /predict`
- Payload example:

```json
{
  "features": {
    "Task_Duration_Days": 14,
    "Labor_Required": 6,
    "Equipment_Units": 2,
    "Material_Cost_KSH": 100000,
    "Start_Constraint": 1,
    "Risk_Level": "MEDIUM",
    "Resource_Constraint_Score": 3,
    "Site_Constraint_Score": 2,
    "Dependency_Count": 1
  }
}
```

- Response example includes predicted delay, probability, and risk factors.

## Extra Notes

- The mobile application uses **Zustand** for state management and **React Navigation** for navigation.
- The ML service depends on a serialized model located in `ml_service/models/` and feature importance metadata.
- `prepare_data.py` appears to be the preprocessing script for dataset construction.

- Update authentication to use a secure backend service rather than in-app state for production use
- Connect the mobile app to the ML service for live delay prediction and risk analytics
