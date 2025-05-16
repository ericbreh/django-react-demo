import json
import os
from datetime import date

DATA_FILE = os.path.join(os.path.dirname(__file__), "actions.json")


def _to_json_safe(obj):
    if isinstance(obj, date):
        return obj.isoformat()
    raise TypeError(f"{type(obj)} is not JSON serializable")


def load_data():
    if not os.path.exists(DATA_FILE) or os.path.getsize(DATA_FILE) == 0:
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2, default=_to_json_safe)
