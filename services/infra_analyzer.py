import os
import json
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class InfrastructureAnalyzer:
    """AI-powered infrastructure analyzer for deployment recommendations."""
    
    def __init__(self):
        self.hosting_platforms = {
            'aws': {
                'name': 'Amazon Web Services',
                'services': ['EC2', 'ECS', 'EKS', 'Lambda', 'RDS', 'ElastiCache', 'S3', 'CloudFront'],
                'pricing': 'pay-as-you-go',
                'scalability': 'high',
                'complexity': 'medium'
            },
            'azure': {
                'name': 'Microsoft Azure',
                'services': ['Virtual Machines', 'Container Instances', 'Kubernetes Service', 'Functions', 'SQL Database', 'Redis Cache', 'Blob Storage', 'CDN'],
                'pricing': 'pay-as-you-go',
                'scalability': 'high',
                'complexity': 'medium'
            },
            'gcp': {
                'name': 'Google Cloud Platform',
                'services': ['Compute Engine', 'Cloud Run', 'GKE', 'Cloud Functions', 'Cloud SQL', 'Memorystore', 'Cloud Storage', 'Cloud CDN'],
                'pricing': 'pay-as-you-go',
                'scalability': 'high',
                'complexity': 'medium'
            },
            'heroku': {
                'name': 'Heroku',
                'services': ['Dynos', 'Heroku Postgres', 'Redis', 'Object Storage'],
                'pricing': 'tiered',
                'scalability': 'medium',
                'complexity': 'low'
            },
            'vercel': {
                'name': 'Vercel',
                'services': ['Serverless Functions', 'Edge Network', 'KV Storage'],
                'pricing': 'usage-based',
                'scalability': 'high',
                'complexity': 'low'
            },
            'netlify': {
                'name': 'Netlify',
                'services': ['Static Sites', 'Functions', 'Edge Functions'],
                'pricing': 'usage-based',
                'scalability': 'high',
                'complexity': 'low'
            },
            'digitalocean': {
                'name': 'DigitalOcean',
                'services': ['Droplets', 'App Platform', 'Kubernetes', 'Managed Databases', 'Spaces'],
                'pricing': 'fixed-monthly',
                'scalability': 'medium',
                'complexity': 'low'
            }
        }
        
        self.database_solutions = {
            'postgresql': {
                'type': 'relational',
                'scaling': 'vertical_and_horizontal',
                'hosting': ['aws-rds', 'azure-sql', 'cloud-sql', 'heroku-postgres', 'digitalocean-managed'],
                'best_for': ['complex_queries', 'transactions', 'data_consistency']
            },
            'mysql': {
                'type': 'relational',
                'scaling': 'vertical_and_horizontal',
                'hosting': ['aws-rds', 'azure-mysql', 'cloud-sql', 'digitalocean-managed'],
                'best_for': ['web_apps', 'ecommerce', 'general_purpose']
            },
            'mongodb': {
                'type': 'document',
                'scaling': 'horizontal_sharding',
                'hosting': ['mongodb-atlas', 'aws-documentdb'],
                'best_for': ['flexible_schema', 'big_data', 'real_time_apps']
            },
            'redis': {
                'type': 'in-memory',
                'scaling': 'horizontal_clustering',
                'hosting': ['aws-elasticache', 'azure-redis', 'memorystore', 'heroku-redis'],
                'best_for': ['caching', 'sessions', 'real_time_analytics']
            },
            'dynamodb': {
                'type': 'document',
                'scaling': 'automatic',
                'hosting': ['aws-dynamodb'],
                'best_for': ['serverless_apps', 'high_throughput', 'aws_ecosystem']
            }
        }
    
    def analyze_project_infrastructure(self, project_path: str) -> Dict:
        """Analyze project to determine infrastructure needs."""
        analysis = {
            'project_type': None,
            'framework': None,
            'database': None,
            'caching': None,
            'storage': None,
            'cdn': None,
            'monitoring': None,
            'security': None,
            'scaling_requirements': 'low',
            'traffic_patterns': 'unknown',
            'budget_considerations': 'medium',
            'team_expertise': 'medium',
            'deployment_complexity': 'medium'
        }
        
        try:
            path = Path(project_path)
            if not path.exists():
                return analysis
            
            # Analyze project structure
            analysis.update(self._analyze_project_structure(path))
            
            # Analyze dependencies
            analysis.update(self._analyze_dependencies(path))
            
            # Analyze configuration files
            analysis.update(self._analyze_configuration(path))
            
            # Determine infrastructure requirements
            analysis.update(self._determine_requirements(analysis))
            
        except Exception as e:
            logger.error(f"Error analyzing project infrastructure: {e}")
        
        return analysis
    
    def _analyze_project_structure(self, path: Path) -> Dict:
        """Analyze project structure and files."""
        structure_info = {
            'project_type': 'unknown',
            'framework': None,
            'has_database': False,
            'has_caching': False,
            'has_static_files': False,
            'has_background_jobs': False,
            'has_websockets': False,
            'has_api': False,
            'has_frontend': False
        }
        
        # Check for common files and directories
        indicators = {
            'requirements.txt': 'python',
            'package.json': 'node',
            'go.mod': 'go',
            'Cargo.toml': 'rust',
            'pom.xml': 'java',
            'Gemfile': 'ruby',
            'composer.json': 'php'
        }
        
        for file, lang in indicators.items():
            if (path / file).exists():
                structure_info['project_type'] = lang
                break
        
        # Framework detection
        framework_files = {
            'django': ['manage.py', 'settings.py'],
            'flask': ['app.py', 'wsgi.py'],
            'fastapi': ['main.py'],
            'react': ['src/App.js', 'src/App.tsx'],
            'next': ['next.config.js'],
            'vue': ['vue.config.js'],
            'angular': ['angular.json'],
            'spring': ['src/main/java'],
            'rails': ['config/application.rb'],
            'laravel': ['artisan']
        }
        
        for framework, files in framework_files.items():
            if any((path / file).exists() for file in files):
                structure_info['framework'] = framework
                break
        
        # Check for database usage
        db_indicators = ['models/', 'migrations/', 'seeds/', 'database/', 'db/', 'sql']
        structure_info['has_database'] = any((path / indicator).exists() for indicator in db_indicators)
        
        # Check for caching
        cache_indicators = ['redis', 'memcached', 'cache']
        structure_info['has_caching'] = any(indicator in str(path) for indicator in cache_indicators)
        
        # Check for static files
        static_indicators = ['public/', 'static/', 'assets/', 'dist/']
        structure_info['has_static_files'] = any((path / indicator).exists() for indicator in static_indicators)
        
        # Check for background jobs
        job_indicators = ['celery', 'bull', 'sidekiq', 'workers/', 'jobs/']
        structure_info['has_background_jobs'] = any(indicator in str(path) for indicator in job_indicators)
        
        # Check for websockets
        ws_indicators = ['websocket', 'socket.io', 'ws', 'wss']
        structure_info['has_websockets'] = any(indicator in str(path).lower() for indicator in ws_indicators)
        
        # Check for API
        api_indicators = ['api/', 'routes/', 'controllers/', 'endpoints/']
        structure_info['has_api'] = any((path / indicator).exists() for indicator in api_indicators)
        
        # Check for frontend
        frontend_indicators = ['src/', 'components/', 'views/', 'templates/']
        structure_info['has_frontend'] = any((path / indicator).exists() for indicator in frontend_indicators)
        
        return structure_info
    
    def _analyze_dependencies(self, path: Path) -> Dict:
        """Analyze project dependencies for infrastructure clues."""
        deps_info = {
            'database': None,
            'caching': None,
            'monitoring': None,
            'security': None,
            'testing': None,
            'build_tools': None
        }
        
        # Analyze Python dependencies
        if (path / 'requirements.txt').exists():
            try:
                with open(path / 'requirements.txt', 'r') as f:
                    deps = [line.strip().lower() for line in f if line.strip() and not line.startswith('#')]
                
                # Database detection
                if any(db in deps for db in ['psycopg2', 'sqlalchemy', 'django', 'flask-sqlalchemy']):
                    deps_info['database'] = 'postgresql'
                elif any(db in deps for db in ['mysql-connector', 'pymysql']):
                    deps_info['database'] = 'mysql'
                elif any(db in deps for db in ['pymongo', 'mongoengine']):
                    deps_info['database'] = 'mongodb'
                
                # Caching detection
                if any(cache in deps for cache in ['redis', 'django-redis', 'flask-redis']):
                    deps_info['caching'] = 'redis'
                elif any(cache in deps for cache in ['memcached', 'python-memcached']):
                    deps_info['caching'] = 'memcached'
                
                # Monitoring detection
                if any(monitor in deps for monitor in ['prometheus', 'grafana', 'sentry', 'newrelic']):
                    deps_info['monitoring'] = 'external'
                
                # Security detection
                if any(sec in deps for sec in ['jwt', 'oauth', 'cryptography', 'bcrypt']):
                    deps_info['security'] = 'advanced'
                
            except Exception as e:
                logger.error(f"Error analyzing Python dependencies: {e}")
        
        # Analyze Node.js dependencies
        if (path / 'package.json').exists():
            try:
                with open(path / 'package.json', 'r') as f:
                    package_data = json.load(f)
                
                deps = list(package_data.get('dependencies', {}).keys())
                dev_deps = list(package_data.get('devDependencies', {}).keys())
                all_deps = deps + dev_deps
                
                # Database detection
                if any(db in all_deps for db in ['pg', 'postgres', 'knex', 'sequelize', 'typeorm']):
                    deps_info['database'] = 'postgresql'
                elif any(db in all_deps for db in ['mysql', 'mysql2']):
                    deps_info['database'] = 'mysql'
                elif any(db in all_deps for db in ['mongodb', 'mongoose']):
                    deps_info['database'] = 'mongodb'
                
                # Caching detection
                if any(cache in all_deps for cache in ['redis', 'ioredis', 'connect-redis']):
                    deps_info['caching'] = 'redis'
                elif any(cache in all_deps for cache in ['memcached', 'memcached-client']):
                    deps_info['caching'] = 'memcached'
                
                # Monitoring detection
                if any(monitor in all_deps for monitor in ['prometheus', 'grafana', 'sentry', 'newrelic', 'winston']):
                    deps_info['monitoring'] = 'external'
                
                # Security detection
                if any(sec in all_deps for sec in ['jsonwebtoken', 'passport', 'bcrypt', 'helmet']):
                    deps_info['security'] = 'advanced'
                
            except Exception as e:
                logger.error(f"Error analyzing Node.js dependencies: {e}")
        
        return deps_info
    
    def _analyze_configuration(self, path: Path) -> Dict:
        """Analyze configuration files for infrastructure insights."""
        config_info = {
            'environment_vars': [],
            'services': [],
            'ports': [],
            'volumes': [],
            'networks': []
        }
        
        # Check for Docker configuration
        if (path / 'docker-compose.yml').exists():
            try:
                with open(path / 'docker-compose.yml', 'r') as f:
                    content = f.read()
                    # Simple parsing for services, ports, volumes
                    config_info['services'] = ['docker']
                    if 'ports:' in content:
                        config_info['ports'].append('docker')
                    if 'volumes:' in content:
                        config_info['volumes'].append('docker')
            except Exception as e:
                logger.error(f"Error analyzing docker-compose.yml: {e}")
        
        # Check for Kubernetes configuration
        k8s_files = list(path.glob('**/*.yaml')) + list(path.glob('**/*.yml'))
        for k8s_file in k8s_files:
            try:
                with open(k8s_file, 'r') as f:
                    content = f.read()
                    if 'apiVersion:' in content and 'kind:' in content:
                        config_info['services'].append('kubernetes')
                        break
            except Exception as e:
                logger.error(f"Error analyzing Kubernetes config: {e}")
        
        # Check for environment files
        env_files = ['.env', '.env.local', '.env.production']
        for env_file in env_files:
            if (path / env_file).exists():
                try:
                    with open(path / env_file, 'r') as f:
                        lines = f.readlines()
                        config_info['environment_vars'] = [line.strip().split('=')[0] for line in lines if '=' in line and not line.startswith('#')]
                except Exception as e:
                    logger.error(f"Error analyzing {env_file}: {e}")
        
        return config_info
    
    def _determine_requirements(self, analysis: Dict) -> Dict:
        """Determine infrastructure requirements based on analysis."""
        requirements = {
            'scaling_requirements': 'low',
            'traffic_patterns': 'unknown',
            'budget_considerations': 'medium',
            'team_expertise': 'medium',
            'deployment_complexity': 'medium'
        }
        
        # Determine scaling requirements
        if analysis.get('has_api') and analysis.get('has_database'):
            requirements['scaling_requirements'] = 'medium'
        if analysis.get('has_websockets') or analysis.get('has_background_jobs'):
            requirements['scaling_requirements'] = 'high'
        
        # Determine traffic patterns
        if analysis.get('framework') in ['react', 'next', 'vue', 'angular']:
            requirements['traffic_patterns'] = 'frontend_heavy'
        elif analysis.get('has_api') and not analysis.get('has_frontend'):
            requirements['traffic_patterns'] = 'api_heavy'
        elif analysis.get('has_database') and analysis.get('has_api'):
            requirements['traffic_patterns'] = 'full_stack'
        
        # Determine deployment complexity
        complexity_factors = 0
        if analysis.get('has_database'): complexity_factors += 1
        if analysis.get('has_caching'): complexity_factors += 1
        if analysis.get('has_background_jobs'): complexity_factors += 1
        if analysis.get('has_websockets'): complexity_factors += 1
        if analysis.get('monitoring'): complexity_factors += 1
        
        if complexity_factors <= 1:
            requirements['deployment_complexity'] = 'low'
        elif complexity_factors <= 3:
            requirements['deployment_complexity'] = 'medium'
        else:
            requirements['deployment_complexity'] = 'high'
        
        return requirements
    
    def recommend_hosting_platform(self, analysis: Dict) -> Dict:
        """Recommend hosting platform based on project analysis."""
        recommendations = {
            'primary': None,
            'alternatives': [],
            'reasoning': []
        }
        
        framework = analysis.get('framework', '')
        project_type = analysis.get('project_type', '')
        complexity = analysis.get('deployment_complexity', 'medium')
        scaling = analysis.get('scaling_requirements', 'low')
        
        # Simple recommendation logic
        if framework in ['react', 'next', 'vue', 'angular'] and not analysis.get('has_database'):
            recommendations['primary'] = 'vercel'
            recommendations['alternatives'] = ['netlify', 'aws']
            recommendations['reasoning'].append("Frontend-only applications work best with specialized platforms")
        
        elif framework in ['django', 'flask', 'fastapi'] and scaling == 'low':
            recommendations['primary'] = 'heroku'
            recommendations['alternatives'] = ['digitalocean', 'aws']
            recommendations['reasoning'].append("Simple Python applications are well-suited for PaaS platforms")
        
        elif scaling == 'high' or complexity == 'high':
            recommendations['primary'] = 'aws'
            recommendations['alternatives'] = ['azure', 'gcp']
            recommendations['reasoning'].append("High scaling requirements need cloud providers with comprehensive services")
        
        elif project_type == 'node' and scaling == 'medium':
            recommendations['primary'] = 'vercel'
            recommendations['alternatives'] = ['heroku', 'aws']
            recommendations['reasoning'].append("Node.js applications work well with serverless platforms")
        
        else:
            recommendations['primary'] = 'aws'
            recommendations['alternatives'] = ['azure', 'digitalocean']
            recommendations['reasoning'].append("AWS provides the most comprehensive solution for general applications")
        
        return recommendations
    
    def recommend_database_solution(self, analysis: Dict) -> Dict:
        """Recommend database solution based on project analysis."""
        recommendations = {
            'primary': None,
            'alternatives': [],
            'hosting': [],
            'reasoning': []
        }
        
        current_db = analysis.get('database')
        scaling = analysis.get('scaling_requirements', 'low')
        framework = analysis.get('framework', '')
        
        if current_db:
            recommendations['primary'] = current_db
            recommendations['reasoning'].append(f"Current project uses {current_db}")
        
        # Framework-specific recommendations
        if framework in ['django', 'flask', 'fastapi']:
            if not current_db:
                recommendations['primary'] = 'postgresql'
                recommendations['alternatives'] = ['mysql', 'mongodb']
                recommendations['reasoning'].append("Python frameworks work well with PostgreSQL")
        
        elif framework in ['react', 'next', 'vue', 'angular']:
            if not current_db:
                recommendations['primary'] = 'postgresql'
                recommendations['alternatives'] = ['mongodb', 'mysql']
                recommendations['reasoning'].append("PostgreSQL provides good balance for modern web applications")
        
        # Scaling considerations
        if scaling == 'high':
            if recommendations['primary'] != 'mongodb':
                recommendations['alternatives'].insert(0, 'mongodb')
                recommendations['reasoning'].append("MongoDB offers excellent horizontal scaling")
        
        # Hosting recommendations
        if recommendations['primary']:
            db_info = self.database_solutions.get(recommendations['primary'], {})
            recommendations['hosting'] = db_info.get('hosting', [])
        
        return recommendations
    
    def recommend_caching_strategy(self, analysis: Dict) -> Dict:
        """Recommend caching strategy based on project analysis."""
        recommendations = {
            'solution': None,
            'strategy': [],
            'hosting': [],
            'reasoning': []
        }
        
        current_cache = analysis.get('caching')
        scaling = analysis.get('scaling_requirements', 'low')
        has_database = analysis.get('has_database', False)
        has_api = analysis.get('has_api', False)
        
        if current_cache:
            recommendations['solution'] = current_cache
            recommendations['reasoning'].append(f"Current project uses {current_cache}")
        elif has_database or has_api:
            recommendations['solution'] = 'redis'
            recommendations['reasoning'].append("Redis provides versatile caching for database and API responses")
        else:
            recommendations['solution'] = 'memory'
            recommendations['reasoning'].append("Simple in-memory caching is sufficient for basic applications")
        
        # Strategy recommendations
        if has_database:
            recommendations['strategy'].append('database_query_cache')
        if has_api:
            recommendations['strategy'].append('api_response_cache')
        if analysis.get('has_frontend'):
            recommendations['strategy'].append('static_asset_cache')
        
        # Hosting recommendations
        if recommendations['solution'] == 'redis':
            recommendations['hosting'] = ['aws-elasticache', 'azure-redis', 'memorystore', 'heroku-redis']
        
        return recommendations
    
    def recommend_monitoring_solution(self, analysis: Dict) -> Dict:
        """Recommend monitoring solution based on project analysis."""
        recommendations = {
            'solution': None,
            'metrics': [],
            'alerts': [],
            'hosting': [],
            'reasoning': []
        }
        
        current_monitoring = analysis.get('monitoring')
        complexity = analysis.get('deployment_complexity', 'medium')
        
        if current_monitoring:
            recommendations['solution'] = 'external'
            recommendations['reasoning'].append("Project already has external monitoring")
        elif complexity == 'low':
            recommendations['solution'] = 'basic'
            recommendations['reasoning'].append("Basic logging and health checks are sufficient")
        else:
            recommendations['solution'] = 'comprehensive'
            recommendations['reasoning'].append("Comprehensive monitoring needed for complex applications")
        
        # Metrics recommendations
        recommendations['metrics'] = [
            'application_performance',
            'error_rates',
            'resource_usage',
            'response_times'
        ]
        
        if analysis.get('has_database'):
            recommendations['metrics'].append('database_performance')
        
        if analysis.get('has_api'):
            recommendations['metrics'].append('api_metrics')
        
        # Alert recommendations
        recommendations['alerts'] = [
            'high_error_rate',
            'slow_response_time',
            'high_cpu_usage',
            'memory_usage'
        ]
        
        return recommendations
    
    def generate_infrastructure_report(self, analysis: Dict) -> Dict:
        """Generate comprehensive infrastructure report."""
        report = {
            'summary': {},
            'recommendations': {
                'hosting': self.recommend_hosting_platform(analysis),
                'database': self.recommend_database_solution(analysis),
                'caching': self.recommend_caching_strategy(analysis),
                'monitoring': self.recommend_monitoring_solution(analysis)
            },
            'architecture': {
                'type': self._determine_architecture_type(analysis),
                'components': self._identify_components(analysis),
                'scaling_strategy': self._recommend_scaling_strategy(analysis)
            },
            'security': {
                'recommendations': self._recommend_security_measures(analysis),
                'compliance': self._check_compliance_needs(analysis)
            },
            'cost_estimates': self._estimate_costs(analysis),
            'implementation_steps': self._generate_implementation_steps(analysis)
        }
        
        return report
    
    def _determine_architecture_type(self, analysis: Dict) -> str:
        """Determine recommended architecture type."""
        scaling = analysis.get('scaling_requirements', 'low')
        complexity = analysis.get('deployment_complexity', 'medium')
        
        if scaling == 'low' and complexity == 'low':
            return 'monolith'
        elif scaling == 'high' or complexity == 'high':
            return 'microservices'
        else:
            return 'modular_monolith'
    
    def _identify_components(self, analysis: Dict) -> List[str]:
        """Identify required infrastructure components."""
        components = ['application']
        
        if analysis.get('has_database'):
            components.append('database')
        
        if analysis.get('has_caching'):
            components.append('cache')
        
        if analysis.get('has_static_files'):
            components.append('cdn')
        
        if analysis.get('has_background_jobs'):
            components.append('queue')
        
        if analysis.get('has_websockets'):
            components.append('websocket_server')
        
        components.extend(['load_balancer', 'monitoring'])
        
        return components
    
    def _recommend_scaling_strategy(self, analysis: Dict) -> Dict:
        """Recommend scaling strategy."""
        scaling = analysis.get('scaling_requirements', 'low')
        
        if scaling == 'low':
            return {
                'type': 'vertical',
                'auto_scaling': False,
                'load_balancer': False
            }
        elif scaling == 'medium':
            return {
                'type': 'horizontal',
                'auto_scaling': True,
                'load_balancer': True
            }
        else:
            return {
                'type': 'horizontal',
                'auto_scaling': True,
                'load_balancer': True,
                'cdn': True,
                'database_scaling': True
            }
    
    def _recommend_security_measures(self, analysis: Dict) -> List[str]:
        """Recommend security measures."""
        measures = ['ssl_tls', 'firewall', 'access_control']
        
        if analysis.get('has_api'):
            measures.extend(['api_authentication', 'rate_limiting'])
        
        if analysis.get('has_database'):
            measures.append('database_encryption')
        
        if analysis.get('security') == 'advanced':
            measures.extend(['waf', 'ddos_protection', 'audit_logging'])
        
        return measures
    
    def _check_compliance_needs(self, analysis: Dict) -> List[str]:
        """Check for compliance requirements."""
        compliance = []
        
        # This would typically be based on user input or project type
        if analysis.get('has_database'):
            compliance.append('gdpr')
        
        return compliance
    
    def _estimate_costs(self, analysis: Dict) -> Dict:
        """Estimate monthly costs for recommended infrastructure."""
        # This is a simplified cost estimation
        scaling = analysis.get('scaling_requirements', 'low')
        complexity = analysis.get('deployment_complexity', 'medium')
        
        if scaling == 'low' and complexity == 'low':
            return {
                'monthly_range': '$20-50',
                'breakdown': {
                    'hosting': '$15-30',
                    'database': '$5-15',
                    'monitoring': '$0-5'
                }
            }
        elif scaling == 'medium' or complexity == 'medium':
            return {
                'monthly_range': '$100-300',
                'breakdown': {
                    'hosting': '$50-150',
                    'database': '$30-100',
                    'monitoring': '$20-50'
                }
            }
        else:
            return {
                'monthly_range': '$500-2000+',
                'breakdown': {
                    'hosting': '$200-800',
                    'database': '$150-600',
                    'monitoring': '$150-600'
                }
            }
    
    def _generate_implementation_steps(self, analysis: Dict) -> List[str]:
        """Generate implementation steps."""
        steps = [
            'Set up version control and CI/CD pipeline',
            'Configure development environment',
            'Set up hosting platform',
            'Configure database and caching',
            'Implement monitoring and logging',
            'Set up security measures',
            'Deploy to staging environment',
            'Perform testing and validation',
            'Deploy to production',
            'Set up backup and disaster recovery'
        ]
        
        return steps
