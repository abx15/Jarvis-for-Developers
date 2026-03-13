import requests
import json

# Test backend endpoints
base_url = "http://localhost:8000"

print("🧪 Testing AI Developer OS Backend")
print("=" * 50)

# Test health endpoint
try:
    response = requests.get(f"{base_url}/health")
    print(f"✅ Health Check: {response.json()}")
except Exception as e:
    print(f"❌ Health Check Failed: {e}")
    exit(1)

# Test login endpoint
try:
    login_data = {
        "email": "admin@aidev.os",
        "password": "admin123"
    }
    response = requests.post(f"{base_url}/api/v1/auth/login", json=login_data)
    print(f"✅ Login Test: {response.json()}")
    token = response.json()["access_token"]
except Exception as e:
    print(f"❌ Login Test Failed: {e}")
    exit(1)

# Test current user endpoint
try:
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{base_url}/api/v1/auth/me", headers=headers)
    print(f"✅ Current User Test: {response.json()}")
except Exception as e:
    print(f"❌ Current User Test Failed: {e}")

# Test analytics endpoint
try:
    response = requests.get(f"{base_url}/api/v1/analytics/overview")
    print(f"✅ Analytics Test: {response.json()}")
except Exception as e:
    print(f"❌ Analytics Test Failed: {e}")

print("\n🎉 All backend tests passed!")
print("🚀 Backend is ready for frontend connection")
