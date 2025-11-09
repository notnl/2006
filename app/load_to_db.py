from supabase import create_client, Client
import csv
import os
import datetime
import json

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
#MAP_FILE = os.path.join(BASE_DIR, "data/Map_Data.csv") #

# Simulated date for testing (YYYY, M)

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


def load_map_csv_data(filepath, key_field="Town"):
    data = {}
    if not os.path.exists(filepath):
        print(f"❌ File not found: {filepath}")
        return data

    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            #print(row)
            town = row[key_field]
            value = row.get('vertices')
            #print(town)


            if not value or value.strip() == "-":
                continue

            try:
                verticesArray = value.split('|');
                saveArr = []
                for i in verticesArray:
                    for j in i.split(','):
                        saveArr.append(float(j))

                data[town] = saveArr
                
            except ValueError:
                continue

    print(f"✅ Loaded {len(data)} towns from {os.path.basename(filepath)}")
    return data
# ----------------------------
# MAIN FUNCTION
# ----------------------------
def upload_energy_data(year,month):
    column_name = f"{year}.{month}".strip()
    print(f"📅 Uploading data for: {column_name}")

    # Load data from both files
    electricity_data = load_csv_data(ELECTRICITY_FILE, column_name)
    gas_data = load_csv_data(GAS_FILE, column_name)
    #map_data = load_map_csv_data(MAP_FILE)
    #print(
    # Merge based on town name
    all_towns = set(electricity_data.keys()) | set(gas_data.keys()) 
    print(f"🏙 Found total {len(all_towns)} towns to update")

    # Update Supabase table
    for town in all_towns:
        update_payload = {}
        green_score = 0 
        if town in electricity_data:
            update_payload["electricity"] = electricity_data[town]
            elec_score = 100 / (1+(electricity_data[town] / 410))**1.3
        if town in gas_data:
            update_payload["gas"] = gas_data[town]
            gas_score = 100 / (1+(gas_data[town] / 70))**1.0

        green_score = round((elec_score + gas_score)/2, 1)
        update_payload["green_score"] = green_score

            
        #if town in map_data: 
        #    update_payload["vertices"] =  (map_data[town])
        #    #print(map_data[town])

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

def Monthly_Update_Green_Score(year,month):
    year, month = YEAR, MONTH
    column_name = f"{year}.{month}".strip()
    print(f"📅 Uploading data for: {column_name}")
    pass

# ----------------------------
# RUN SCRIPT
# ----------------------------
if __name__ == "__main__":
    YEAR = 2023
    MONTH = 10  # (change this manually to simulate other months)

    upload_energy_data(YEAR,MONTH)


