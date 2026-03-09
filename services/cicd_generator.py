import os
import json
from typing import Dict, List, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class CICDGenerator:
    """AI-powered CI/CD pipeline generator for different platforms."""
    
    def __init__(self):
        self.ci_platforms = {
            'github': 'GitHub Actions',
            'gitlab': 'GitLab CI',
            'azure': 'Azure DevOps',
            'jenkins': 'Jenkins',
            'circleci': 'CircleCI',
            'bitbucket': 'Bitbucket Pipelines'
        }
    
    def generate_github_actions(self, project_info: Dict, options: Optional[Dict] = None) -> str:
        """Generate GitHub Actions workflow file."""
        framework = project_info.get('framework', '').lower()
        port = project_info.get('port', '8000')
        has_tests = options.get('has_tests', True) if options else True
        deploy_target = options.get('deploy_target', 'docker') if options else 'docker'
        
        workflow = f"""name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  PYTHON_VERSION: '3.11'

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{{{ matrix.node-version }}}}
        cache: 'npm'
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{{{ env.PYTHON_VERSION }}}}
        cache: 'pip'
    
    - name: Install dependencies
      run: |
"""
        
        if framework in ['python', 'django', 'flask', 'fastapi']:
            workflow += """        python -m pip install --upgrade pip
        if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
        if [ -f requirements-dev.txt ]; then pip install -r requirements-dev.txt; fi
"""
        
        if framework in ['node', 'react', 'next', 'vue']:
            workflow += """        npm ci
"""
        
        if has_tests:
            workflow += """    
    - name: Run tests
      run: |
"""
            if framework in ['python', 'django', 'flask', 'fastapi']:
                workflow += """        python -m pytest tests/ -v --cov=. --cov-report=xml
        python -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
        python -m flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
"""
            elif framework in ['node', 'react', 'next', 'vue']:
                workflow += """        npm run test
        npm run lint
        npm run type-check || true
"""
        
        workflow += """
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      if: matrix.node-version == '18'
      with:
        file: ./coverage.xml
        flags: unittests
        name: codecov-umbrella

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{{{ secrets.DOCKER_USERNAME }}}}
        password: ${{{{ secrets.DOCKER_PASSWORD }}}}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: |
          ${{{{ secrets.DOCKER_USERNAME }}}}/${{{{ github.event.repository.name }}}}:latest
          ${{{{ secrets.DOCKER_USERNAME }}}}/${{{{ github.event.repository.name }}}}:${{{{ github.sha }}}}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  security-scan:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'

  deploy:
    needs: [test, build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to production
      run: |
        echo "Deploying to production..."
        # Add your deployment commands here
        # Example: kubectl apply -f k8s/
        # Example: docker-compose up -d
"""
        
        return workflow
    
    def generate_gitlab_ci(self, project_info: Dict, options: Optional[Dict] = None) -> str:
        """Generate GitLab CI configuration."""
        framework = project_info.get('framework', '').lower()
        port = project_info.get('port', '8000')
        
        gitlab_ci = f"""stages:
  - test
  - build
  - security
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

# Test stage
test:
  stage: test
  image: 
    name: python:3.11-slim
    entrypoint: [""]
  services:
    - postgres:15-alpine
    - redis:7-alpine
  variables:
    POSTGRES_DB: test_db
    POSTGRES_USER: test_user
    POSTGRES_PASSWORD: test_password
    DATABASE_URL: postgresql://test_user:test_password@postgres:5432/test_db
    REDIS_URL: redis://redis:6379/0
  before_script:
    - apt-get update -y && apt-get install -y build-essential curl
    - python -m pip install --upgrade pip
    - if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
    - if [ -f requirements-dev.txt ]; then pip install -r requirements-dev.txt; fi
  script:
    - python -m pytest tests/ -v --cov=. --cov-report=xml
    - python -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
  coverage: '/TOTAL.+\\d+%.+$/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml
    paths:
      - coverage.xml
    expire_in: 1 week
  only:
    - merge_requests
    - main
    - develop

# Build stage
build:
  stage: build
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  variables:
    IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    LATEST_TAG: $CI_REGISTRY_IMAGE:latest
  before_script:
    - echo $CI_REGISTRY_PASSWORD | docker login -u $CI_REGISTRY_USER --password-stdin $CI_REGISTRY
  script:
    - docker build --pull -t $IMAGE_TAG .
    - docker tag $IMAGE_TAG $LATEST_TAG
    - docker push $IMAGE_TAG
    - docker push $LATEST_TAG
  only:
    - main
    - develop

# Security scan
security-scan:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy fs --format json --output /tmp/trivy-results.json .
    - trivy fs --format sarif --output /tmp/trivy-results.sarif .
  artifacts:
    reports:
      sast: /tmp/trivy-results.sarif
    paths:
      - /tmp/trivy-results.json
    expire_in: 1 week
  only:
    - main
    - develop

# Deploy to staging
deploy-staging:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan $STAGING_SERVER >> ~/.ssh/known_hosts
    - chmod 644 ~/.ssh/known_hosts
  script:
    - |
      ssh $STAGING_USER@$STAGING_SERVER << 'EOF'
        cd /opt/app
        docker-compose pull
        docker-compose up -d
        docker system prune -f
      EOF
  environment:
    name: staging
    url: https://staging.yourapp.com
  only:
    - develop

# Deploy to production
deploy-production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan $PRODUCTION_SERVER >> ~/.ssh/known_hosts
    - chmod 644 ~/.ssh/known_hosts
  script:
    - |
      ssh $PRODUCTION_USER@$PRODUCTION_SERVER << 'EOF'
        cd /opt/app
        docker-compose pull
        docker-compose up -d
        docker system prune -f
      EOF
  environment:
    name: production
    url: https://yourapp.com
  when: manual
  only:
    - main
"""
        
        return gitlab_ci
    
    def generate_azure_devops(self, project_info: Dict, options: Optional[Dict] = None) -> str:
        """Generate Azure DevOps pipeline."""
        framework = project_info.get('framework', '').lower()
        
        azure_pipeline = f"""# Azure DevOps Pipeline for {framework.title()} Application

trigger:
  branches:
    include:
    - main
    - develop
  paths:
    exclude:
    - docs/
    - '*.md'

pr:
  branches:
    include:
    - main

variables:
  pythonVersion: '3.11'
  nodeVersion: '18'
  dockerRegistryServiceConnection: 'docker-hub'
  imageRepository: '$(Build.Repository.Name)'
  containerRegistry: 'your-docker-registry'
  dockerfilePath: '$(Build.SourcesDirectory)/Dockerfile'
  tag: '$(Build.BuildId)'

pool:
  vmImage: 'ubuntu-latest'

stages:
- stage: Test
  displayName: 'Test Stage'
  jobs:
  - job: Test
    displayName: 'Run Tests'
    strategy:
      matrix:
        Python38:
          pythonVersion: '3.8'
        Python311:
          pythonVersion: '3.11'
    
    steps:
    - task: UsePythonVersion@0
      inputs:
        versionSpec: '$(pythonVersion)'
      displayName: 'Use Python $(pythonVersion)'
    
    - task: NodeTool@0
      inputs:
        versionSpec: '$(nodeVersion)'
      displayName: 'Use Node.js $(nodeVersion)'
    
    - script: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
      displayName: 'Install Python dependencies'
    
    - script: |
        npm ci
      displayName: 'Install Node.js dependencies'
    
    - script: |
        python -m pytest tests/ -v --cov=. --cov-report=xml
        python -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
      displayName: 'Run Python tests and linting'
    
    - script: |
        npm run test
        npm run lint
      displayName: 'Run Node.js tests and linting'
    
    - task: PublishCodeCoverageResults@1
      inputs:
        codeCoverageTool: Cobertura
        summaryFileLocation: 'coverage.xml'
      displayName: 'Publish code coverage'

- stage: Build
  displayName: 'Build Stage'
  dependsOn: Test
  jobs:
  - job: Build
    displayName: 'Build and Push Docker Image'
    
    steps:
    - task: Docker@2
      displayName: 'Build and push Docker image'
      inputs:
        containerRegistry: '$(dockerRegistryServiceConnection)'
        repository: '$(imageRepository)'
        command: 'buildAndPush'
        Dockerfile: '$(dockerfilePath)'
        tags: |
          $(tag)
          latest

- stage: Security
  displayName: 'Security Scan'
  dependsOn: Build
  jobs:
  - job: SecurityScan
    displayName: 'Run Security Scans'
    
    steps:
    - task: TrivyScanner@0
      displayName: 'Run Trivy vulnerability scanner'
      inputs:
        scanType: 'fs'
        scanPath: '$(Build.SourcesDirectory)'
        formatType: 'sarif'
        outputFile: 'trivy-results.sarif'
    
    - task: PublishSecurityAnalysisResults@1
      displayName: 'Publish security analysis results'
      inputs:
        artifactName: 'CodeAnalysisLogs'
        tool: 'Trivy'
        summaryFile: 'trivy-results.sarif'

- stage: Deploy
  displayName: 'Deploy Stage'
  dependsOn: [Test, Build, Security]
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  jobs:
  - deployment: DeployToProduction
    displayName: 'Deploy to Production'
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: KubernetesManifest@0
            displayName: 'Deploy to Kubernetes'
            inputs:
              action: 'deploy'
              kubernetesServiceConnection: 'k8s-cluster'
              namespace: 'production'
              manifests: 'k8s/*.yaml'
              containers: '$(imageRepository):$(tag)'
"""
        
        return azure_pipeline
    
    def generate_jenkins_pipeline(self, project_info: Dict, options: Optional[Dict] = None) -> str:
        """Generate Jenkins pipeline."""
        framework = project_info.get('framework', '').lower()
        
        jenkins_pipeline = f"""pipeline {{
    agent any
    
    environment {{
        DOCKER_REGISTRY = 'your-docker-registry.com'
        IMAGE_NAME = '${{env.JOB_NAME.toLowerCase()}}'
        IMAGE_TAG = '${{env.BUILD_NUMBER}}'
    }}
    
    stages {{
        stage('Checkout') {{
            steps {{
                checkout scm
            }}
        }}
        
        stage('Setup Environment') {{
            steps {{
                sh '''
                    echo "Setting up Python environment..."
                    python3 -m venv venv
                    source venv/bin/activate
                    pip install --upgrade pip
                    
                    echo "Setting up Node.js environment..."
                    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                    sudo apt-get install -y nodejs
                '''
            }}
        }}
        
        stage('Install Dependencies') {{
            parallel {{
                stage('Python Dependencies') {{
                    steps {{
                        sh '''
                            source venv/bin/activate
                            if [ -f requirements.txt ]; then
                                pip install -r requirements.txt
                            fi
                            if [ -f requirements-dev.txt ]; then
                                pip install -r requirements-dev.txt
                            fi
                        '''
                    }}
                }}
                stage('Node.js Dependencies') {{
                    steps {{
                        sh '''
                            if [ -f package.json ]; then
                                npm ci
                            fi
                        '''
                    }}
                }}
            }}
        }}
        
        stage('Test') {{
            parallel {{
                stage('Python Tests') {{
                    steps {{
                        sh '''
                            source venv/bin/activate
                            python -m pytest tests/ -v --cov=. --cov-report=xml --cov-report=html
                            python -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
                            python -m flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
                        '''
                    }}
                    post {{
                        always {{
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'htmlcov',
                                reportFiles: 'index.html',
                                reportName: 'Coverage Report'
                            ])
                        }}
                    }}
                }}
                stage('Node.js Tests') {{
                    steps {{
                        sh '''
                            if [ -f package.json ]; then
                                npm run test
                                npm run lint
                            fi
                        '''
                    }}
                }}
            }}
        }}
        
        stage('Build Docker Image') {{
            steps {{
                script {{
                    docker.build("${{env.DOCKER_REGISTRY}}/${{env.IMAGE_NAME}}:${{env.IMAGE_TAG}}", ".")
                    docker.withRegistry("https://${{env.DOCKER_REGISTRY}}", 'docker-registry-credentials') {{
                        docker.image("${{env.DOCKER_REGISTRY}}/${{env.IMAGE_NAME}}:${{env.IMAGE_TAG}}").push()
                        docker.image("${{env.DOCKER_REGISTRY}}/${{env.IMAGE_NAME}}:latest").push()
                    }}
                }}
            }}
        }}
        
        stage('Security Scan') {{
            steps {{
                sh '''
                    # Install Trivy
                    sudo apt-get install wget apt-transport-https gnupg lsb-release
                    wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
                    echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
                    sudo apt-get update
                    sudo apt-get install trivy
                    
                    # Run security scan
                    trivy image --format json --output trivy-report.json ${{env.DOCKER_REGISTRY}}/${{env.IMAGE_NAME}}:${{env.IMAGE_TAG}}
                    trivy image --format sarif --output trivy-report.sarif ${{env.DOCKER_REGISTRY}}/${{env.IMAGE_NAME}}:${{env.IMAGE_TAG}}
                '''
                archiveArtifacts artifacts: 'trivy-report.*', fingerprint: true
            }}
        }}
        
        stage('Deploy') {{
            when {{
                branch 'main'
            }}
            steps {{
                script {{
                    // Deploy to production
                    sh '''
                        echo "Deploying to production..."
                        # Add your deployment commands here
                        # Example: kubectl apply -f k8s/
                        # Example: docker-compose up -d
                    '''
                }}
            }}
        }}
    }}
    
    post {{
        always {{
            cleanWs()
        }}
        success {{
            echo "Pipeline succeeded!"
        }}
        failure {{
            echo "Pipeline failed!"
            mail to: 'devops@yourcompany.com',
                 subject: "Jenkins Build Failed: ${{env.JOB_NAME}} - ${{env.BUILD_NUMBER}}",
                 body: "The Jenkins build ${{env.BUILD_NUMBER}} for ${{env.JOB_NAME}} has failed.\\n\\nCheck console output at: ${{env.BUILD_URL}}"
        }}
    }}
}}
"""
        
        return jenkins_pipeline
    
    def generate_circleci_config(self, project_info: Dict, options: Optional[Dict] = None) -> str:
        """Generate CircleCI configuration."""
        framework = project_info.get('framework', '').lower()
        
        circleci_config = f"""version: 2.1

orbs:
  docker: circleci/docker@2.2.0
  node: circleci/node@5.1.0
  python: circleci/python@2.1.1

executors:
  python-executor:
    docker:
      - image: cimg/python:3.11
        environment:
          PIPENV_VENV_IN_PROJECT: true
    working_directory: ~/project

  node-executor:
    docker:
      - image: cimg/node:18
    working_directory: ~/project

jobs:
  setup-python:
    executor: python-executor
    steps:
      - checkout
      - python/install-packages:
          pkg-manager: pip
          pip-dependency-file: requirements.txt
      - persist_to_workspace:
          root: ~/project
          paths:
            - ./*

  setup-node:
    executor: node-executor
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - persist_to_workspace:
          root: ~/project
          paths:
            - ./*

  test-python:
    executor: python-executor
    steps:
      - attach_workspace:
          at: ~/project
      - python/install-packages:
          pkg-manager: pip
          pip-dependency-file: requirements-dev.txt
      - run:
          name: Run Python tests
          command: |
            python -m pytest tests/ -v --cov=. --cov-report=xml --cov-report=html
            python -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: htmlcov
          destination: coverage
      - store_artifacts:
          path: coverage.xml
          destination: coverage-xml

  test-node:
    executor: node-executor
    steps:
      - attach_workspace:
          at: ~/project
      - run:
          name: Run Node.js tests
          command: |
            npm run test
            npm run lint
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: coverage
          destination: coverage

  build-and-push:
    executor: docker/docker
    steps:
      - checkout
      - setup_remote_docker
      - docker/check:
          docker-username: DOCKER_USERNAME
          docker-password: DOCKER_PASSWORD
      - docker/build:
          image: $CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME
          tag: $CIRCLE_SHA1,latest
      - docker/push:
          image: $CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME
          tag: $CIRCLE_SHA1,latest

  security-scan:
    executor: docker/docker
    steps:
      - checkout
      - setup_remote_docker
      - run:
          name: Install Trivy
          command: |
            apk add --no-cache curl
            curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
      - run:
          name: Run security scan
          command: |
            trivy image --format json --output trivy-report.json $CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME:$CIRCLE_SHA1
            trivy image --format sarif --output trivy-report.sarif $CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME:$CIRCLE_SHA1
      - store_artifacts:
          path: trivy-report.json
          destination: security-scan
      - store_artifacts:
          path: trivy-report.sarif
          destination: security-scan-sarif

  deploy:
    executor: docker/docker
    steps:
      - checkout
      - run:
          name: Deploy to production
          command: |
            echo "Deploying to production..."
            # Add your deployment commands here

workflows:
  version: 2
  test-and-build:
    jobs:
      - setup-python
      - setup-node
      - test-python:
          requires:
            - setup-python
      - test-node:
          requires:
            - setup-node
      - build-and-push:
          requires:
            - test-python
            - test-node
          filters:
            branches:
              only:
                - main
                - develop
      - security-scan:
          requires:
            - build-and-push
          filters:
            branches:
              only:
                - main
                - develop
      - deploy:
          requires:
            - build-and-push
            - security-scan
          filters:
            branches:
              only:
                - main
"""
        
        return circleci_config
    
    def generate_dockerfile_pipeline(self, project_info: Dict, options: Optional[Dict] = None) -> str:
        """Generate Docker-based CI/CD pipeline."""
        port = project_info.get('port', '8000')
        
        docker_pipeline = f"""# Docker-based CI/CD Pipeline

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Run tests
RUN npm run test
RUN npm run lint

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install production dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

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

# Start application
CMD ["npm", "start"]
"""
        
        return docker_pipeline
    
    def generate_deployment_manifests(self, project_info: Dict, options: Optional[Dict] = None) -> Dict[str, str]:
        """Generate Kubernetes deployment manifests."""
        framework = project_info.get('framework', '').lower()
        port = project_info.get('port', '8000')
        app_name = options.get('app_name', 'myapp') if options else 'myapp'
        
        manifests = {}
        
        # Deployment manifest
        manifests['deployment.yaml'] = f"""apiVersion: apps/v1
kind: Deployment
metadata:
  name: {app_name}
  labels:
    app: {app_name}
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: {app_name}
  template:
    metadata:
      labels:
        app: {app_name}
        version: v1
    spec:
      containers:
      - name: {app_name}
        image: your-registry/{app_name}:latest
        ports:
        - containerPort: {port}
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "{port}"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: {app_name}-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: {port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: {port}
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
"""
        
        # Service manifest
        manifests['service.yaml'] = f"""apiVersion: v1
kind: Service
metadata:
  name: {app_name}
  labels:
    app: {app_name}
spec:
  selector:
    app: {app_name}
  ports:
  - protocol: TCP
    port: 80
    targetPort: {port}
  type: ClusterIP
"""
        
        # Ingress manifest
        manifests['ingress.yaml'] = f"""apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {app_name}
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - {app_name}.yourdomain.com
    secretName: {app_name}-tls
  rules:
  - host: {app_name}.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: {app_name}
            port:
              number: 80
"""
        
        # ConfigMap manifest
        manifests['configmap.yaml'] = f"""apiVersion: v1
kind: ConfigMap
metadata:
  name: {app_name}-config
data:
  NODE_ENV: "production"
  PORT: "{port}"
  LOG_LEVEL: "info"
  CACHE_TTL: "3600"
"""
        
        # Secret manifest
        manifests['secret.yaml'] = f"""apiVersion: v1
kind: Secret
metadata:
  name: {app_name}-secrets
type: Opaque
data:
  database-url: <base64-encoded-database-url>
  jwt-secret: <base64-encoded-jwt-secret>
  api-key: <base64-encoded-api-key>
"""
        
        # HorizontalPodAutoscaler manifest
        manifests['hpa.yaml'] = f"""apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {app_name}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {app_name}
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
"""
        
        return manifests
    
    def optimize_pipeline(self, pipeline_content: str, platform: str) -> str:
        """Optimize CI/CD pipeline for better performance."""
        optimizations = []
        
        if platform == 'github':
            optimizations.append("Consider using caching for dependencies")
            optimizations.append("Use matrix builds for multiple environments")
        elif platform == 'gitlab':
            optimizations.append("Use GitLab's built-in Docker registry")
            optimizations.append("Leverage GitLab's caching mechanism")
        elif platform == 'jenkins':
            optimizations.append("Use Jenkins shared libraries for common tasks")
            optimizations.append("Implement proper error handling and notifications")
        
        return pipeline_content
