import pandas as pd
import json
from datetime import datetime, timedelta

def process_excel_data():
    # Read the Excel file
    print("Reading Excel file...")
    df = pd.read_excel('data with scrollable plot.xlsx')
    
    print(f"Total rows in Excel: {len(df)}")
    print(f"Columns: {df.columns.tolist()}")
    
    # Show first few rows to understand the data structure
    print("\nFirst 5 rows:")
    print(df.head())
    
    # Convert to the format needed for the chart
    chart_data = []
    
    for index, row in df.iterrows():
        # Create time string from timeOrigin
        try:
            if pd.notna(row['timeOrigin']):
                # Parse the time from timeOrigin
                time_str = str(row['timeOrigin'])
                chart_data.append({
                    "time": time_str,
                    "time_hours": float(row['time']) if pd.notna(row['time']) else 0.0,
                    "oil_press_speed": float(row['Oil Press Speed']) if pd.notna(row['Oil Press Speed']) else 0.0,
                    "pv_power": float(row['PV Power (W)']) if pd.notna(row['PV Power (W)']) else 0.0,
                    "press_power": float(row['Press Power (W)']) if pd.notna(row['Press Power (W)']) else 0.0,
                    "soc": float(row['SOC']) if pd.notna(row['SOC']) else 0.0,
                    "reward": float(row['Reward']) if pd.notna(row['Reward']) else 0.0
                })
        except Exception as e:
            print(f"Error processing row {index}: {e}")
            continue
    
    print(f"\nProcessed {len(chart_data)} data points")
    
    # Save to JSON file
    with open('static/data/chart_data_full.json', 'w') as f:
        json.dump(chart_data, f, indent=2)
    
    print(f"Saved full dataset to static/data/chart_data_full.json")
    return len(chart_data)

if __name__ == "__main__":
    total_points = process_excel_data()
    print(f"Total data points processed: {total_points}") 