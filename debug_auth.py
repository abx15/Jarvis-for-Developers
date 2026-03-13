import requests
import json

# Debug authentication
base_url = "http://localhost:8000"

print("🔍 Debug Authentication")
print("=" * 30)

# Login
login_data = {
    "email": "admin@aidev.os",
    "password": "admin123"
}
response = requests.post(f"{base_url}/api/v1/auth/login", json=login_data)
login_result = response.json()
token = login_result["access_token"]

print(f"Login Result: {json.dumps(login_result, indent=2)}")
print(f"Token: {token}")

# Get current user
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{base_url}/api/v1/auth/me", headers=headers)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    try:
        user_result = response.json()
        print(f"User Result: {json.dumps(user_result, indent=2)}")
    except:
        print("Failed to parse JSON")
