#!/usr/bin/env python3
"""
Database Schema Setup Script
Runs the database schema creation
"""

import sys
import os
from sqlalchemy import create_engine, text

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'apps', 'api'))

from config import settings

def setup_database():
    """Create database tables using schema.sql"""
    
    # Create database engine
    engine = create_engine(settings.DATABASE_URL)
    
    # Read schema file
    schema_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'schema.sql')
    
    with open(schema_path, 'r') as f:
        schema_sql = f.read()
    
    # Split SQL into individual statements
    statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]
    
    with engine.connect() as connection:
        for statement in statements:
            try:
                connection.execute(text(statement))
                print(f"✓ Executed: {statement[:50]}...")
            except Exception as e:
                if "already exists" not in str(e) and "does not exist" not in str(e):
                    print(f"❌ Error: {e}")
                    print(f"Statement: {statement}")
        
        connection.commit()
        print("\n🎉 Database schema setup completed!")

if __name__ == "__main__":
    setup_database()
