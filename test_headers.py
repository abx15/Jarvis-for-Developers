import requests
import json

# Test headers
base_url = "http://localhost:8000"

print("🔍 Testing Headers")
print("=" * 25)

# Login
login_data = {
    "email": "admin@aidev.os",
    "password": "admin123"
}
response = requests.post(f"{base_url}/api/v1/auth/login", json=login_data)
login_result = response.json()
token = login_result["access_token"]

print(f"Token: {token}")

# Test different header formats
headers_list = [
    {"Authorization": f"Bearer {token}"},
    {"authorization": f"Bearer {token}"},
    {"Authorization": token},
]

for i, headers in enumerate(headers_list, 1):
    print(f"\nTest {i}: Headers = {headers}")
    try:
        response = requests.get(f"{base_url}/api/v1/auth/me", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
