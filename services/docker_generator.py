import os
import json
from typing import Dict, List, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class DockerfileGenerator:
    """AI-powered Dockerfile generator for different project types."""
    
    def __init__(self):
        self.framework_patterns = {
            'python': ['requirements.txt', 'setup.py', 'pyproject.toml', 'main.py', 'app.py'],
            'node': ['package.json', 'package-lock.json', 'yarn.lock', 'npm.lock'],
            'react': ['package.json', 'public/', 'src/', 'next.config.js', 'nuxt.config.js'],
            'django': ['manage.py', 'settings.py', 'requirements.txt'],
            'flask': ['app.py', 'requirements.txt', 'wsgi.py'],
            'fastapi': ['main.py', 'requirements.txt', 'uvicorn'],
            'spring': ['pom.xml', 'src/main/java', 'build.gradle'],
            'go': ['go.mod', 'go.sum', 'main.go'],
            'rust': ['Cargo.toml', 'Cargo.lock', 'src/main.rs'],
            'ruby': ['Gemfile', 'Gemfile.lock', 'config.ru'],
            'php': ['composer.json', 'composer.lock', 'public/index.php'],
            'java': ['pom.xml', 'build.gradle', 'src/main/java']
        }
    
    def analyze_project(self, project_path: str) -> Dict:
        """Analyze project structure to determine framework and dependencies."""
        project_info = {
            'framework': None,
            'language': None,
            'dependencies': [],
            'build_files': [],
            'entry_points': [],
            'port': None,
            'environment_vars': []
        }
        
        try:
            path = Path(project_path)
            if not path.exists():
                return project_info
            
            # Detect framework and language
            for framework, patterns in self.framework_patterns.items():
                for pattern in patterns:
                    if (path / pattern).exists():
                        project_info['framework'] = framework
                        project_info['language'] = framework
                        break
            
            # Find entry points
            common_entry_points = [
                'main.py', 'app.py', 'index.js', 'server.js', 'main.go',
                'src/main.rs', 'src/index.js', 'src/app.js'
            ]
            
            for entry_point in common_entry_points:
                if (path / entry_point).exists():
                    project_info['entry_points'].append(entry_point)
            
            # Extract dependencies
            if (path / 'requirements.txt').exists():
                with open(path / 'requirements.txt', 'r') as f:
                    project_info['dependencies'] = [line.strip() for line in f if line.strip() and not line.startswith('#')]
            
            if (path / 'package.json').exists():
                with open(path / 'package.json', 'r') as f:
                    package_data = json.load(f)
                    project_info['dependencies'] = list(package_data.get('dependencies', {}).keys())
                    project_info['build_files'].append('package.json')
            
            # Detect common ports
            port_patterns = {
                '8000': ['uvicorn', 'django', 'fastapi'],
                '3000': ['react', 'next', 'vue'],
                '5000': ['flask'],
                '8080': ['spring', 'tomcat'],
                '4000': ['graphql'],
                '9000': ['nestjs']
            }
            
            for port, frameworks in port_patterns.items():
                if any(framework in project_info['dependencies'] for framework in frameworks):
                    project_info['port'] = port
                    break
            
        except Exception as e:
            logger.error(f"Error analyzing project: {e}")
        
        return project_info
    
    def generate_dockerfile(self, project_info: Dict, custom_options: Optional[Dict] = None) -> str:
        """Generate optimized Dockerfile based on project analysis."""
        framework = project_info.get('framework', '').lower()
        language = project_info.get('language', '').lower()
        
        if framework in ['python', 'django', 'flask', 'fastapi']:
            return self._generate_python_dockerfile(project_info, custom_options)
        elif framework in ['node', 'react', 'next', 'vue']:
            return self._generate_node_dockerfile(project_info, custom_options)
        elif framework == 'go':
            return self._generate_go_dockerfile(project_info, custom_options)
        elif framework == 'rust':
            return self._generate_rust_dockerfile(project_info, custom_options)
        elif framework in ['java', 'spring']:
            return self._generate_java_dockerfile(project_info, custom_options)
        else:
            return self._generate_generic_dockerfile(project_info, custom_options)
    
    def _generate_python_dockerfile(self, project_info: Dict, custom_options: Optional[Dict] = None) -> str:
        """Generate Dockerfile for Python applications."""
        port = project_info.get('port', '8000')
        python_version = custom_options.get('python_version', '3.11') if custom_options else '3.11'
        
        dockerfile = f"""FROM python:{python_version}-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \\
    && apt-get install -y --no-install-recommends \\
        build-essential \\
        curl \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \\
    && chown -R app:app /app
USER app

# Expose port
EXPOSE {port}

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:{port}/health || exit 1

# Run the application
"""
        
        # Add appropriate CMD based on framework
        framework = project_info.get('framework', '').lower()
        if framework == 'django':
            dockerfile += f'CMD ["python", "manage.py", "runserver", "0.0.0.0:{port}"]\n'
        elif framework == 'flask':
            dockerfile += f'CMD ["python", "app.py"]\n'
        elif framework == 'fastapi':
            dockerfile += f'CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "{port}"]\n'
        else:
            entry_point = project_info.get('entry_points', ['main.py'])[0]
            dockerfile += f'CMD ["python", "{entry_point}"]\n'
        
        return dockerfile
    
    def _generate_node_dockerfile(self, project_info: Dict, custom_options: Optional[Dict] = None) -> str:
        """Generate Dockerfile for Node.js applications."""
        port = project_info.get('port', '3000')
        node_version = custom_options.get('node_version', '18') if custom_options else '18'
        
        dockerfile = f"""FROM node:{node_version}-alpine

# Set work directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy project files
COPY . .

# Build the application (if needed)
RUN npm run build || true

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE {port}

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
    CMD wget --no-verbose --tries=1 --spider http://localhost:{port}/ || exit 1

# Run the application
"""
        
        framework = project_info.get('framework', '').lower()
        if framework in ['next', 'nuxt']:
            dockerfile += f'CMD ["npm", "start"]\n'
        elif framework == 'react':
            dockerfile += f'CMD ["npm", "start"]\n'
        else:
            dockerfile += f'CMD ["npm", "start"]\n'
        
        return dockerfile
    
    def _generate_go_dockerfile(self, project_info: Dict, custom_options: Optional[Dict] = None) -> str:
        """Generate Dockerfile for Go applications."""
        port = project_info.get('port', '8080')
        go_version = custom_options.get('go_version', '1.21') if custom_options else '1.21'
        
        return f"""FROM golang:{go_version}-alpine AS builder

# Set work directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Set work directory
WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/main .

# Create non-root user
RUN addgroup -g 1001 -S appgroup
RUN adduser -S appuser -u 1001 -G appgroup
RUN chown -R appuser:appgroup /root
USER appuser

# Expose port
EXPOSE {port}

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
    CMD wget --no-verbose --tries=1 --spider http://localhost:{port}/ || exit 1

# Run the application
CMD ["./main"]
"""
    
    def _generate_rust_dockerfile(self, project_info: Dict, custom_options: Optional[Dict] = None) -> str:
        """Generate Dockerfile for Rust applications."""
        port = project_info.get('port', '8000')
        
        return f"""FROM rust:1.75-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \\
    pkg-config \\
    libssl-dev \\
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy Cargo files
COPY Cargo.toml Cargo.lock ./

# Create dummy main.rs to cache dependencies
RUN mkdir src && echo "fn main() {{}}" > src/main.rs
RUN cargo build --release
RUN rm -rf src

# Copy source code
COPY src ./src

# Build the application
RUN cargo build --release

# Final stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \\
    ca-certificates \\
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/target/release/main .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \\
    && chown -R app:app /app
USER app

# Expose port
EXPOSE {port}

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
    CMD wget --no-verbose --tries=1 --spider http://localhost:{port}/ || exit 1

# Run the application
CMD ["./main"]
"""
    
    def _generate_java_dockerfile(self, project_info: Dict, custom_options: Optional[Dict] = None) -> str:
        """Generate Dockerfile for Java applications."""
        port = project_info.get('port', '8080')
        java_version = custom_options.get('java_version', '17') if custom_options else '17'
        
        return f"""FROM openjdk:{java_version}-jdk-slim

# Set work directory
WORKDIR /app

# Copy Maven/Gradle files
COPY pom.xml ./
RUN mvn dependency:go-offline || true

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \\
    && chown -R app:app /app
USER app

# Expose port
EXPOSE {port}

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
    CMD wget --no-verbose --tries=1 --spider http://localhost:{port}/actuator/health || exit 1

# Run the application
CMD ["java", "-jar", "target/*.jar"]
"""
    
    def _generate_generic_dockerfile(self, project_info: Dict, custom_options: Optional[Dict] = None) -> str:
        """Generate generic Dockerfile for unknown frameworks."""
        port = project_info.get('port', '8000')
        
        return f"""FROM alpine:latest

# Install basic dependencies
RUN apk update && apk add --no-cache \\
    python3 \\
    python3-pip \\
    nodejs \\
    npm \\
    curl \\
    && rm -rf /var/cache/apk/*

# Set work directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies based on available files
RUN if [ -f requirements.txt ]; then pip3 install -r requirements.txt; fi
RUN if [ -f package.json ]; then npm install; fi

# Create non-root user
RUN addgroup -g 1001 -S appgroup
RUN adduser -S appuser -u 1001 -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port
EXPOSE {port}

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:{port}/ || exit 1

# Generic run command
CMD ["sh", "-c", "python3 main.py || node index.js || python3 app.py || echo 'No suitable entry point found'"]
"""
    
    def generate_docker_compose(self, project_info: Dict, services: Optional[List[Dict]] = None) -> str:
        """Generate docker-compose.yml file."""
        port = project_info.get('port', '8000')
        service_name = project_info.get('framework', 'app').lower()
        
        compose_content = f"""version: '3.8'

services:
  {service_name}:
    build: .
    ports:
      - "{port}:{port}"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/myapp
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:{port}/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  postgres_data:
"""
        
        return compose_content
    
    def optimize_dockerfile(self, dockerfile_content: str) -> str:
        """Optimize Dockerfile for better performance and security."""
        optimizations = []
        
        lines = dockerfile_content.split('\n')
        optimized_lines = []
        
        for line in lines:
            # Add multi-stage build optimization
            if line.startswith('FROM') and 'builder' not in line and len([l for l in lines if l.startswith('FROM')]) == 1:
                if 'python' in line.lower() or 'node' in line.lower():
                    optimizations.append("Consider using multi-stage builds for smaller final images")
            
            # Add security recommendations
            if 'USER root' in line or line.strip() == 'USER root':
                optimizations.append("Avoid running as root user")
            
            optimized_lines.append(line)
        
        return '\n'.join(optimized_lines)
