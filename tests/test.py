import requests
import json
from datetime import datetime

BASE_URL = "https://atharvakote-food-dash-env.hf.space"

OUTPUT_FILE = "api_test_report.txt"


def log(section, data):
    with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
        f.write(f"\n{'='*60}\n")
        f.write(f"{section}\n")
        f.write(f"{'='*60}\n")
        f.write(data + "\n")


def pretty(obj):
    return json.dumps(obj, indent=2)


def test_endpoint(name, method, endpoint, payload=None):
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            res = requests.get(url)
        else:
            res = requests.post(url, json=payload)

        output = (
            f"Endpoint: {endpoint}\n"
            f"Method: {method}\n"
            f"Status Code: {res.status_code}\n"
            f"Request Body:\n{pretty(payload) if payload else 'None'}\n\n"
            f"Response:\n{pretty(res.json())}\n"
        )

    except Exception as e:
        output = f"ERROR: {str(e)}"

    log(name, output)


def main():
    # Clear file
    with open(OUTPUT_FILE, "w") as f:
        f.write(f"API TEST REPORT\nGenerated: {datetime.now()}\n")

    # ---------------------------
    # HEALTH CHECK
    # ---------------------------
    test_endpoint("Health Check", "GET", "/health")

    # ---------------------------
    # RESET TEST
    # ---------------------------
    test_endpoint("Reset Easy", "POST", "/reset", {"task": "easy"})
    test_endpoint("Reset Invalid Task", "POST", "/reset", {"task": "invalid"})

    # ---------------------------
    # VALID STEP FLOW
    # ---------------------------
    test_endpoint("Step 1 - Process", "POST", "/step", {
        "action_type": "process",
        "order_id": 1
    })

    test_endpoint("Step 2 - Process", "POST", "/step", {
        "action_type": "process",
        "order_id": 2
    })

    test_endpoint("Step 3 - Prioritize", "POST", "/step", {
        "action_type": "prioritize",
        "order_id": 1
    })

    test_endpoint("Step 4 - Idle", "POST", "/step", {
        "action_type": "idle",
        "order_id": None
    })

    # ---------------------------
    # INVALID CASES
    # ---------------------------
    test_endpoint("Invalid Order ID", "POST", "/step", {
        "action_type": "process",
        "order_id": 999
    })

    test_endpoint("Missing order_id", "POST", "/step", {
        "action_type": "process"
    })

    test_endpoint("Wrong Data Type", "POST", "/step", {
        "action_type": "process",
        "order_id": "abc"
    })

    test_endpoint("Invalid Action Type", "POST", "/step", {
        "action_type": "unknown",
        "order_id": 1
    })

    # ---------------------------
    # STATE CHECK
    # ---------------------------
    test_endpoint("State Check", "GET", "/state")

    # ---------------------------
    # TEST ENDPOINTS
    # ---------------------------
    test_endpoint("Full Test", "GET", "/test")
    test_endpoint("Smoke Test", "GET", "/test/smoke")
    test_endpoint("Inference Test", "GET", "/test/inference")


if __name__ == "__main__":
    main()