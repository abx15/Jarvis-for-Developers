#!/usr/bin/env python3
"""
Seed Data Script for AI Developer OS
Creates initial data for development and testing
"""

import sys
import os
from datetime import datetime, timedelta
from passlib.context import CryptContext
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import uuid

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'apps', 'api'))

from database.connection import Base
from config import settings

# Password hashing - using simple hash for seed data
import hashlib

def hash_password(password: str) -> str:
    """Simple password hashing for seed data"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_seed_data():
    """Create seed data for the application"""
    
    # Create database engine
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Create admin user
        admin_password_hash = hash_password("admin123")
        admin_user = {
            'email': 'admin@aidev.os',
            'password_hash': admin_password_hash,
            'name': 'Admin User',
            'avatar': 'https://ui-avatars.com/api/?name=Admin+User&background=0d47a1&color=fff',
            'is_active': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Insert admin user
        db.execute(text("""
            INSERT INTO users (email, password_hash, name, avatar, is_active, created_at, updated_at)
            VALUES (:email, :password_hash, :name, :avatar, :is_active, :created_at, :updated_at)
            ON CONFLICT (email) DO NOTHING
            RETURNING id
        """), admin_user)
        
        # Get admin user ID
        result = db.execute(text("SELECT id FROM users WHERE email = 'admin@aidev.os'"))
        admin_id = result.scalar()
        
        if admin_id:
            print(f"✓ Admin user created with ID: {admin_id}")
            
            # Create demo organization
            org_data = {
                'name': 'Demo Organization',
                'slug': 'demo-org',
                'description': 'A demo organization for testing the AI Developer OS',
                'avatar': 'https://ui-avatars.com/api/?name=Demo+Org&background=388e3c&color=fff',
                'created_by': admin_id,
                'is_active': True,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            db.execute(text("""
                INSERT INTO organizations (name, slug, description, avatar, created_by, is_active, created_at, updated_at)
                VALUES (:name, :slug, :description, :avatar, :created_by, :is_active, :created_at, :updated_at)
                ON CONFLICT (slug) DO NOTHING
                RETURNING id
            """), org_data)
            
            # Get organization ID
            result = db.execute(text("SELECT id FROM organizations WHERE slug = 'demo-org'"))
            org_id = result.scalar()
            
            if org_id:
                print(f"✓ Demo organization created with ID: {org_id}")
                
                # Add admin as organization owner
                db.execute(text("""
                    INSERT INTO organization_members (organization_id, user_id, role, joined_at)
                    VALUES (:organization_id, :user_id, 'owner', :joined_at)
                    ON CONFLICT (organization_id, user_id) DO NOTHING
                """), {
                    'organization_id': org_id,
                    'user_id': admin_id,
                    'joined_at': datetime.utcnow()
                })
                
                print("✓ Admin added as organization owner")
            
            # Create sample repository
            repo_data = {
                'user_id': admin_id,
                'repo_name': 'demo-project',
                'repo_url': 'https://github.com/demo/demo-project',
                'description': 'A demo project for testing AI Developer OS features',
                'is_active': True,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            db.execute(text("""
                INSERT INTO repos (user_id, repo_name, repo_url, description, is_active, created_at, updated_at)
                VALUES (:user_id, :repo_name, :repo_url, :description, :is_active, :created_at, :updated_at)
                RETURNING id
            """), repo_data)
            
            # Get repo ID
            result = db.execute(text("SELECT id FROM repos WHERE repo_name = 'demo-project'"))
            repo_id = result.scalar()
            
            if repo_id:
                print(f"✓ Sample repository created with ID: {repo_id}")
                
                # Create sample bugs
                bugs_data = [
                    {
                        'repo_id': repo_id,
                        'title': 'Memory leak in data processing module',
                        'description': 'The data processing module is not properly cleaning up memory after processing large datasets',
                        'severity': 'high',
                        'status': 'open',
                        'bug_type': 'performance',
                        'file_path': 'src/data_processor.py',
                        'line_number': 145,
                        'code_snippet': 'def process_large_dataset(data):\n    # Memory leak here\n    processed_data = []\n    for item in data:\n        processed_data.append(process_item(item))\n    return processed_data',
                        'ai_analysis': '{"issue": "memory_leak", "suggestion": "Use generators or batch processing", "confidence": 0.85}',
                        'reported_by': admin_id,
                        'assigned_to': admin_id,
                        'resolved_at': None,
                        'created_at': datetime.utcnow(),
                        'updated_at': datetime.utcnow()
                    },
                    {
                        'repo_id': repo_id,
                        'title': 'Authentication token not being validated properly',
                        'description': 'JWT tokens are not being properly validated in the API middleware',
                        'severity': 'critical',
                        'status': 'in_progress',
                        'bug_type': 'security',
                        'file_path': 'src/middleware/auth.py',
                        'line_number': 23,
                        'code_snippet': 'def validate_token(token):\n    # Missing validation\n    return True',
                        'ai_analysis': '{"issue": "security_vulnerability", "suggestion": "Implement proper JWT validation", "confidence": 0.95}',
                        'reported_by': admin_id,
                        'assigned_to': admin_id,
                        'resolved_at': None,
                        'created_at': datetime.utcnow() - timedelta(hours=2),
                        'updated_at': datetime.utcnow() - timedelta(hours=1)
                    },
                    {
                        'repo_id': repo_id,
                        'title': 'UI button not responsive on mobile devices',
                        'description': 'The submit button in the form is not properly styled for mobile screens',
                        'severity': 'low',
                        'status': 'resolved',
                        'bug_type': 'ui',
                        'file_path': 'src/components/Form.jsx',
                        'line_number': 67,
                        'code_snippet': '<button className="submit-btn">Submit</button>',
                        'ai_analysis': '{"issue": "responsive_design", "suggestion": "Add mobile-specific CSS classes", "confidence": 0.75}',
                        'reported_by': admin_id,
                        'assigned_to': admin_id,
                        'resolved_at': datetime.utcnow() - timedelta(hours=3),
                        'created_at': datetime.utcnow() - timedelta(days=1),
                        'updated_at': datetime.utcnow() - timedelta(hours=3)
                    }
                ]
                
                for bug in bugs_data:
                    db.execute(text("""
                        INSERT INTO bugs (repo_id, title, description, severity, status, bug_type, file_path, line_number, code_snippet, ai_analysis, reported_by, assigned_to, created_at, updated_at, resolved_at)
                        VALUES (:repo_id, :title, :description, :severity, :status, :bug_type, :file_path, :line_number, :code_snippet, :ai_analysis, :reported_by, :assigned_to, :created_at, :updated_at, :resolved_at)
                    """), bug)
                
                print("✓ Sample bugs created")
                
                # Create sample AI tasks
                tasks_data = [
                    {
                        'user_id': admin_id,
                        'repo_id': repo_id,
                        'task_type': 'bug_fix',
                        'task_description': 'Fix memory leak in data processing module',
                        'task_input': '{"bug_id": 1, "file_path": "src/data_processor.py"}',
                        'task_output': '{"solution": "Implement generator-based processing", "code": "def process_large_dataset(data):\\n    for item in data:\\n        yield process_item(item)"}',
                        'status': 'completed',
                        'agent_type': 'openai',
                        'confidence_score': 0.85,
                        'execution_time_seconds': 45,
                        'created_at': datetime.utcnow() - timedelta(minutes=30),
                        'started_at': datetime.utcnow() - timedelta(minutes=30),
                        'completed_at': datetime.utcnow() - timedelta(minutes=25)
                    },
                    {
                        'user_id': admin_id,
                        'repo_id': repo_id,
                        'task_type': 'code_generation',
                        'task_description': 'Generate unit tests for authentication module',
                        'task_input': '{"module": "src/auth.py", "test_types": ["unit", "integration"]}',
                        'task_output': '{"tests_generated": 15, "coverage": "92%"}',
                        'status': 'completed',
                        'agent_type': 'anthropic',
                        'confidence_score': 0.92,
                        'execution_time_seconds': 120,
                        'created_at': datetime.utcnow() - timedelta(hours=1),
                        'started_at': datetime.utcnow() - timedelta(hours=1),
                        'completed_at': datetime.utcnow() - timedelta(minutes=50)
                    },
                    {
                        'user_id': admin_id,
                        'repo_id': repo_id,
                        'task_type': 'refactor',
                        'task_description': 'Refactor API endpoints to use async/await',
                        'task_input': '{"endpoints": ["GET /api/users", "POST /api/data"]}',
                        'task_output': '{"status": "in_progress", "files_modified": 2}',
                        'status': 'running',
                        'agent_type': 'openai',
                        'confidence_score': 0.78,
                        'execution_time_seconds': 0,  # Still running
                        'created_at': datetime.utcnow() - timedelta(minutes=10),
                        'started_at': datetime.utcnow() - timedelta(minutes=5),
                        'completed_at': None
                    }
                ]
                
                for task in tasks_data:
                    db.execute(text("""
                        INSERT INTO agent_tasks (user_id, repo_id, task_type, task_description, task_input, task_output, status, agent_type, confidence_score, execution_time_seconds, created_at, started_at, completed_at)
                        VALUES (:user_id, :repo_id, :task_type, :task_description, :task_input, :task_output, :status, :agent_type, :confidence_score, :execution_time_seconds, :created_at, :started_at, :completed_at)
                    """), task)
                
                print("✓ Sample AI tasks created")
            
            # Create subscription for admin user
            subscription_data = {
                'user_id': admin_id,
                'plan_type': 'pro',
                'status': 'active',
                'current_period_start': datetime.utcnow(),
                'current_period_end': datetime.utcnow() + timedelta(days=30),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            db.execute(text("""
                INSERT INTO subscriptions (user_id, plan_type, status, current_period_start, current_period_end, created_at, updated_at)
                VALUES (:user_id, :plan_type, :status, :current_period_start, :current_period_end, :created_at, :updated_at)
                ON CONFLICT (user_id) DO NOTHING
            """), subscription_data)
            
            print("✓ Pro subscription created for admin user")
        
        # Create demo user
        demo_password_hash = hash_password("demo123")
        demo_user = {
            'email': 'demo@aidev.os',
            'password_hash': demo_password_hash,
            'name': 'Demo User',
            'avatar': 'https://ui-avatars.com/api/?name=Demo+User&background=1976d2&color=fff',
            'is_active': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        db.execute(text("""
            INSERT INTO users (email, password_hash, name, avatar, is_active, created_at, updated_at)
            VALUES (:email, :password_hash, :name, :avatar, :is_active, :created_at, :updated_at)
            ON CONFLICT (email) DO NOTHING
            RETURNING id
        """), demo_user)
        
        result = db.execute(text("SELECT id FROM users WHERE email = 'demo@aidev.os'"))
        demo_id = result.scalar()
        
        if demo_id:
            print(f"✓ Demo user created with ID: {demo_id}")
            
            # Add demo user to organization
            if org_id:
                db.execute(text("""
                    INSERT INTO organization_members (organization_id, user_id, role, joined_at)
                    VALUES (:organization_id, :user_id, 'member', :joined_at)
                    ON CONFLICT (organization_id, user_id) DO NOTHING
                """), {
                    'organization_id': org_id,
                    'user_id': demo_id,
                    'joined_at': datetime.utcnow()
                })
                
                print("✓ Demo user added to organization as member")
            
            # Create free subscription for demo user
            subscription_data = {
                'user_id': demo_id,
                'plan_type': 'free',
                'status': 'active',
                'current_period_start': datetime.utcnow(),
                'current_period_end': datetime.utcnow() + timedelta(days=30),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            db.execute(text("""
                INSERT INTO subscriptions (user_id, plan_type, status, current_period_start, current_period_end, created_at, updated_at)
                VALUES (:user_id, :plan_type, :status, :current_period_start, :current_period_end, :created_at, :updated_at)
                ON CONFLICT (user_id) DO NOTHING
            """), subscription_data)
            
            print("✓ Free subscription created for demo user")
        
        # Commit all changes
        db.commit()
        print("\n🎉 Seed data created successfully!")
        print("\nLogin credentials:")
        print("Admin: admin@aidev.os / admin123")
        print("Demo:  demo@aidev.os / demo123")
        
    except Exception as e:
        print(f"❌ Error creating seed data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_seed_data()
