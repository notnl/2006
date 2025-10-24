from supabase import create_client, Client
import csv
import os
import datetime

# ----------------------------
# CONFIGURATION
# ----------------------------

SUPABASE_URL = "https://txvyegrofdgnbzuxysou.supabase.co"
SUPABASE_KEY = "sb_publishable_m7k1lg1IJDx0jlpa-c-2sQ_ebvK7JS8"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Path to your data files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ELECTRICITY_FILE = os.path.join(BASE_DIR, "data", "Electricity_Data.csv")
GAS_FILE = os.path.join(BASE_DIR, "data", "Gas_Data.csv")

# Simulated date for testing (YYYY, M)
YEAR = 2023
MONTH = 10  # (change this manually to simulate other months)

# ----------------------------
# HELPER FUNCTION TO LOAD DATA
# ----------------------------
def load_csv_data(filepath, column_name, key_field="Town"):
    """Reads a CSV file and returns {Town: value} for the given month column."""
    data = {}

    if not os.path.exists(filepath):
        print(f"❌ File not found: {filepath}")
        return data

    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            town = row[key_field]
            value = row.get(column_name)

            if not value or value.strip() == "-":
                continue

            try:
                usage = float(value)
                data[town] = usage
            except ValueError:
                continue

    print(f"✅ Loaded {len(data)} towns from {os.path.basename(filepath)} ({column_name})")
    return data

# ----------------------------
# MAIN FUNCTION
# ----------------------------
def upload_energy_data():
    year, month = YEAR, MONTH
    column_name = f"{year}.{month}".strip()
    print(f"📅 Uploading data for: {column_name}")

    # Load data from both files
    electricity_data = load_csv_data(ELECTRICITY_FILE, column_name)
    gas_data = load_csv_data(GAS_FILE, column_name)

    # Merge based on town name
    all_towns = set(electricity_data.keys()) | set(gas_data.keys())
    print(f"🏙 Found total {len(all_towns)} towns to update")

    # Update Supabase table
    for town in all_towns:
        update_payload = {}
        green_score = 0 
        if town in electricity_data:
            update_payload["electricity"] = electricity_data[town]
            green_score += electricity_data[town]
        if town in gas_data:
            update_payload["gas"] = gas_data[town]
            green_score += gas_data[town]
        
        update_payload["green_score"] = green_score
        if not update_payload:
            continue

        response = (
            supabase.table("scoreboard")
            .update(update_payload)
            .eq("town_name", town)
            .execute()
        )

        if hasattr(response, "error") and response.error:
            print(f"⚠️ Error updating {town}: {response.error}")
        else:
            print(f"⬆️ Updated {town}: {update_payload}")

    print("🎉 Monthly electricity & gas data upload complete!")

# ----------------------------
# RUN SCRIPT
# ----------------------------
if __name__ == "__main__":
    upload_energy_data()
