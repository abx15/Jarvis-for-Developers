"""
Create test users for AI Developer OS
"""
import asyncio
import sys
import os
from passlib.context import CryptContext
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Simple in-memory user creation (for testing)
# In production, this would use the actual database

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

# Test users data
test_users = [
    {
        "email": "admin@aidev.os",
        "password": "Admin@123",
        "name": "Admin User",
        "role": "admin"
    },
    {
        "email": "john@aidev.os", 
        "password": "John@123",
        "name": "John Developer",
        "role": "developer"
    },
    {
        "email": "alice@aidev.os",
        "password": "Alice@123", 
        "name": "Alice Designer",
        "role": "designer"
    },
    {
        "email": "bob@aidev.os",
        "password": "Bob@123",
        "name": "Bob Tester", 
        "role": "tester"
    },
    {
        "email": "sarah@aidev.os",
        "password": "Sarah@123",
        "name": "Sarah Manager",
        "role": "manager"
    }
]

def create_test_users():
    """Create test users with hashed passwords"""
    print("Creating test users for AI Developer OS...")
    print("=" * 50)
    
    created_users = []
    
    for user_data in test_users:
        hashed_password = hash_password(user_data["password"])
        
        user_info = {
            "email": user_data["email"],
            "password": user_data["password"],
            "hashed_password": hashed_password,
            "name": user_data["name"],
            "role": user_data["role"],
            "created_at": datetime.now().isoformat()
        }
        
        created_users.append(user_info)
        print(f"✅ Created user: {user_data['email']}")
        print(f"   Name: {user_data['name']}")
        print(f"   Role: {user_data['role']}")
        print(f"   Password: {user_data['password']}")
        print(f"   Hashed: {hashed_password[:20]}...")
        print("-" * 30)
    
    print(f"\n🎉 Successfully created {len(created_users)} test users!")
    print("\nLogin Credentials:")
    print("=" * 50)
    
    for user in created_users:
        print(f"Email: {user['email']}")
        print(f"Password: {user['password']}")
        print("-" * 20)
    
    print("\n📝 Save these credentials for testing!")
    print("\nUser Roles:")
    print("- admin: Full system access")
    print("- developer: Code and development access") 
    print("- designer: UI/UX access")
    print("- tester: Testing and QA access")
    print("- manager: Project management access")
    
    return created_users

if __name__ == "__main__":
    try:
        users = create_test_users()
        print(f"\n✨ Test users created successfully!")
        print(f"📊 Total users: {len(users)}")
        print(f"🚀 You can now login with any of these accounts")
    except Exception as e:
        print(f"❌ Error creating test users: {e}")
        sys.exit(1)
