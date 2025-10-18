from flask import Blueprint, jsonify
import csv
import os

data_bp = Blueprint('data', __name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
filename = os.path.join(BASE_DIR, "data", "Electricity_Data.csv")

@data_bp.route('/api/data/electricity', methods=['GET'])
def get_electricity_data():
    data = []

    with open(filename, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            values = []
            for k, v in row.items():
                if k != "Town":
                    try:
                        values.append(float(v) if v.strip() not in ["-", ""] else None)
                    except ValueError:
                        values.append(None)
            
            for val in reversed(values):
                if val is not None:
                    most_recent = val
                    break

            data.append({
                "town": row["Town"],
                "most_recent": most_recent,
                "values": values
            })

    return jsonify(data)
