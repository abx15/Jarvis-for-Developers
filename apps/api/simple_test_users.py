"""
Simple test users for AI Developer OS - Login Credentials
"""

# Test users for manual testing
TEST_USERS = [
    {
        "email": "admin@aidev.os",
        "password": "admin123",
        "name": "Admin User",
        "role": "admin"
    },
    {
        "email": "john@aidev.os", 
        "password": "john123",
        "name": "John Developer",
        "role": "developer"
    },
    {
        "email": "alice@aidev.os",
        "password": "alice123", 
        "name": "Alice Designer",
        "role": "designer"
    },
    {
        "email": "bob@aidev.os",
        "password": "bob123",
        "name": "Bob Tester", 
        "role": "tester"
    },
    {
        "email": "sarah@aidev.os",
        "password": "sarah123",
        "name": "Sarah Manager",
        "role": "manager"
    }
]

def print_test_users():
    """Print test user credentials"""
    print("🎯 AI Developer OS - Test User Credentials")
    print("=" * 60)
    print()
    
    for i, user in enumerate(TEST_USERS, 1):
        print(f"User {i}: {user['name']}")
        print(f"📧 Email: {user['email']}")
        print(f"🔑 Password: {user['password']}")
        print(f"👤 Role: {user['role']}")
        print("-" * 40)
    
    print()
    print("🚀 Quick Start:")
    print("1. Go to http://localhost:3000/login")
    print("2. Use any of the credentials above")
    print("3. Access the full dashboard and features")
    print()
    print("📋 User Roles:")
    print("• admin: Full system access")
    print("• developer: Code and development access")
    print("• designer: UI/UX access")
    print("• tester: Testing and QA access")
    print("• manager: Project management access")
    print()
    print("💡 Tip: Start with 'admin@aidev.os' for full access!")

if __name__ == "__main__":
    print_test_users()
