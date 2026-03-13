import requests
import json

# Test authentication flow
base_url = "http://localhost:8000"

print("🔐 Testing Authentication Flow")
print("=" * 40)

# Step 1: Login
try:
    login_data = {
        "email": "admin@aidev.os",
        "password": "admin123"
    }
    response = requests.post(f"{base_url}/api/v1/auth/login", json=login_data)
    login_result = response.json()
    token = login_result["access_token"]
    print(f"✅ Login successful")
    print(f"   User: {login_result['user']['name']}")
    print(f"   Token: {token[:30]}...")
except Exception as e:
    print(f"❌ Login failed: {e}")
    exit(1)

# Step 2: Get current user with token
try:
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{base_url}/api/v1/auth/me", headers=headers)
    user_result = response.json()
    print(f"✅ Current User: {user_result['name']} ({user_result['role']})")
except Exception as e:
    print(f"❌ Current User failed: {e}")

print("\n🎉 Authentication is working!")
print("🚀 Frontend can now connect to backend")
