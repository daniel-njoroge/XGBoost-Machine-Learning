import pandas as pd
import numpy as np
import os

def prepare_data(input_path, output_path):
    print(f"Reading dataset from {input_path}...")
    df = pd.read_csv(input_path)
    
    # Mapping Risk_Level to Numeric
    risk_map = {'Low': 0, 'Medium': 1, 'High': 2}
    df['Risk_Level_Num'] = df['Risk_Level'].map(risk_map)
    
    # Generate Target: Delay_Days
    np.random.seed(42)
    
    # Base delay logic
    # 1. Blockers (Start_Constraint) add 1:1 to delay
    # 2. Site/Resource pressure adds a percentage of the total duration (Reduced)
    # 3. Risk Level adds a small fixed penalty
    base_delay = (
        (df['Start_Constraint'] * 1.0) + 
        (df['Task_Duration_Days'] * 0.02) + 
        (df['Task_Duration_Days'] * 0.08 * df['Site_Constraint_Score']) + 
        (df['Task_Duration_Days'] * 0.06 * df['Resource_Constraint_Score']) + 
        (df['Risk_Level_Num'] * 0.8) + 
        (df['Dependency_Count'] * 0.3)
    )
    
 
    noise = np.random.normal(0, 1, len(df))
    
    df['Delay_Days'] = base_delay + noise
    
    # Clip negative delays to 0
    df['Delay_Days'] = df['Delay_Days'].clip(lower=0).round(1)
    
    # Save the prepared dataset
    df.to_csv(output_path, index=False)
    print(f"Prepared dataset saved to {output_path}")
    print(df.head())

if __name__ == "__main__":
    raw_data = "ml_service/ml_service/construction_dataset.csv"
    prepared_data = "ml_service/prepared_construction_data_v2.csv"
    
    if os.path.exists(raw_data):
        prepare_data(raw_data, prepared_data)
    else:
        print(f"Error: Raw data not found at {raw_data}")
