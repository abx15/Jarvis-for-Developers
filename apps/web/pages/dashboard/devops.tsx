import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Docker, 
  GitBranch, 
  Server, 
  Cloud, 
  Database, 
  Monitor, 
  Shield, 
  DollarSign,
  Download,
  Upload,
  Play,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Cpu,
  HardDrive
} from 'lucide-react';

interface ProjectInfo {
  framework: string;
  language: string;
  dependencies: string[];
  entry_points: string[];
  port: string;
  environment_vars: string[];
}

interface Config {
  id: number;
  config_type: string;
  config_name: string;
  config_content: string;
  config_metadata: any;
  is_active: boolean;
  created_at: string;
}

interface Deployment {
  id: number;
  deployment_type: string;
  deployment_target: string;
  deployment_status: string;
  started_at: string;
  completed_at?: string;
}

interface Recommendation {
  id: number;
  recommendation_type: string;
  recommendation_data: any;
  confidence_score: number;
  is_accepted: boolean;
  created_at: string;
}

export default function DevOpsDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dockerfile');
  const [projectPath, setProjectPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dockerfile states
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [dockerfile, setDockerfile] = useState('');
  const [dockerCompose, setDockerCompose] = useState('');
  const [dockerOptimizations, setDockerOptimizations] = useState<string[]>([]);
  
  // CI/CD states
  const [cicdPlatform, setCicdPlatform] = useState('github');
  const [cicdPipeline, setCicdPipeline] = useState('');
  const [deploymentManifests, setDeploymentManifests] = useState<Record<string, string>>({});
  
  // Infrastructure states
  const [infraAnalysis, setInfraAnalysis] = useState<any>(null);
  const [infraRecommendations, setInfraRecommendations] = useState<any>(null);
  const [costEstimates, setCostEstimates] = useState<any>(null);
  
  // Saved configs
  const [savedConfigs, setSavedConfigs] = useState<Config[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    loadSavedConfigs();
    loadDeployments();
    loadRecommendations();
  }, []);

  const loadSavedConfigs = async () => {
    try {
      const response = await fetch('/api/v1/devops/configs');
      if (response.ok) {
        const configs = await response.json();
        setSavedConfigs(configs);
      }
    } catch (error) {
      console.error('Error loading configs:', error);
    }
  };

  const loadDeployments = async () => {
    try {
      const response = await fetch('/api/v1/devops/deployments');
      if (response.ok) {
        const deployments = await response.json();
        setDeployments(deployments);
      }
    } catch (error) {
      console.error('Error loading deployments:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await fetch('/api/v1/devops/recommendations');
      if (response.ok) {
        const recommendations = await response.json();
        setRecommendations(recommendations);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const generateDockerfile = async () => {
    if (!projectPath) {
      setError('Please enter a project path');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/v1/devops/generate-dockerfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_path: projectPath,
          custom_options: {
            include_docker_compose: true,
            python_version: '3.11',
            node_version: '18'
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProjectInfo(data.project_info);
        setDockerfile(data.dockerfile);
        setDockerCompose(data.docker_compose || '');
        setDockerOptimizations(data.optimizations);
        setSuccess('Dockerfile generated successfully!');
      } else {
        const error = await response.json();
        setError(error.detail || 'Failed to generate Dockerfile');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateCICD = async () => {
    if (!projectPath) {
      setError('Please enter a project path');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/v1/devops/generate-cicd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_path: projectPath,
          platform: cicdPlatform,
          options: {
            has_tests: true,
            deploy_target: 'docker',
            include_kubernetes: true
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCicdPipeline(data.pipeline_content);
        setDeploymentManifests(data.deployment_manifests || {});
        setSuccess('CI/CD pipeline generated successfully!');
      } else {
        const error = await response.json();
        setError(error.detail || 'Failed to generate CI/CD pipeline');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeInfrastructure = async () => {
    if (!projectPath) {
      setError('Please enter a project path');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/v1/devops/analyze-infra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_path: projectPath,
          include_recommendations: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInfraAnalysis(data.analysis);
        setInfraRecommendations(data.recommendations);
        setCostEstimates(data.cost_estimates);
        setSuccess('Infrastructure analysis completed!');
      } else {
        const error = await response.json();
        setError(error.detail || 'Failed to analyze infrastructure');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configType: string, configName: string, configContent: string) => {
    try {
      const response = await fetch('/api/v1/devops/save-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo_id: 1, // Default repo ID
          config_type: configType,
          config_name: configName,
          config_content: configContent,
          config_metadata: {
            project_path: projectPath,
            generated_at: new Date().toISOString()
          }
        }),
      });

      if (response.ok) {
        setSuccess('Configuration saved successfully!');
        loadSavedConfigs();
      } else {
        const error = await response.json();
        setError(error.detail || 'Failed to save configuration');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DevOps Assistant</h1>
          <p className="text-muted-foreground">AI-powered infrastructure and deployment automation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>AI Enhanced</span>
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Project Analysis</CardTitle>
              <CardDescription>Enter your project path to analyze and generate configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="/path/to/your/project"
                  value={projectPath}
                  onChange={(e) => setProjectPath(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={generateDockerfile} disabled={loading}>
                  <Docker className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
              </div>

              {projectInfo && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Badge variant="outline">{projectInfo.framework}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">Framework</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline">{projectInfo.language}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">Language</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline">{projectInfo.port || 'N/A'}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">Port</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline">{projectInfo.dependencies.length} deps</Badge>
                    <p className="text-sm text-muted-foreground mt-1">Dependencies</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dockerfile" className="flex items-center space-x-2">
                <Docker className="h-4 w-4" />
                <span>Dockerfile</span>
              </TabsTrigger>
              <TabsTrigger value="cicd" className="flex items-center space-x-2">
                <GitBranch className="h-4 w-4" />
                <span>CI/CD</span>
              </TabsTrigger>
              <TabsTrigger value="infrastructure" className="flex items-center space-x-2">
                <Server className="h-4 w-4" />
                <span>Infrastructure</span>
              </TabsTrigger>
              <TabsTrigger value="deployments" className="flex items-center space-x-2">
                <Cloud className="h-4 w-4" />
                <span>Deployments</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dockerfile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Generated Dockerfile</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => saveConfig('dockerfile', 'Dockerfile', dockerfile)}
                        disabled={!dockerfile}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(dockerfile, 'Dockerfile')}
                        disabled={!dockerfile}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dockerfile ? (
                    <div className="space-y-4">
                      <ScrollArea className="h-96 w-full border rounded-md p-4">
                        <pre className="text-sm font-mono">{dockerfile}</pre>
                      </ScrollArea>
                      {dockerOptimizations.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Optimizations Applied:</h4>
                          <div className="flex flex-wrap gap-2">
                            {dockerOptimizations.map((opt, index) => (
                              <Badge key={index} variant="secondary">
                                {opt}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Docker className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Generate a Dockerfile by analyzing your project</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {dockerCompose && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Docker Compose</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(dockerCompose, 'docker-compose.yml')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 w-full border rounded-md p-4">
                      <pre className="text-sm font-mono">{dockerCompose}</pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="cicd" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>CI/CD Pipeline Generator</CardTitle>
                  <CardDescription>Generate CI/CD pipelines for various platforms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Label htmlFor="platform">Platform:</Label>
                    <Select value={cicdPlatform} onValueChange={setCicdPlatform}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="github">GitHub Actions</SelectItem>
                        <SelectItem value="gitlab">GitLab CI</SelectItem>
                        <SelectItem value="azure">Azure DevOps</SelectItem>
                        <SelectItem value="jenkins">Jenkins</SelectItem>
                        <SelectItem value="circleci">CircleCI</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={generateCICD} disabled={loading}>
                      <GitBranch className="h-4 w-4 mr-2" />
                      Generate Pipeline
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {cicdPipeline && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{cicdPlatform.toUpperCase()} Pipeline</span>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveConfig('cicd', `${cicdPlatform}-pipeline`, cicdPipeline)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(cicdPipeline, `${cicdPlatform}-pipeline.yml`)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96 w-full border rounded-md p-4">
                      <pre className="text-sm font-mono">{cicdPipeline}</pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {Object.keys(deploymentManifests).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Kubernetes Manifests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(deploymentManifests).map(([filename, content]) => (
                        <div key={filename}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{filename}</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadFile(content, filename)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                          <ScrollArea className="h-32 w-full border rounded-md p-2">
                            <pre className="text-xs font-mono">{content}</pre>
                          </ScrollArea>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="infrastructure" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Infrastructure Analysis</CardTitle>
                  <CardDescription>AI-powered infrastructure recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={analyzeInfrastructure} disabled={loading} className="mb-4">
                    <Server className="h-4 w-4 mr-2" />
                    Analyze Infrastructure
                  </Button>

                  {infraRecommendations && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Cloud className="h-4 w-4 mr-2" />
                            Hosting Platform
                          </h4>
                          <div className="p-4 border rounded-md">
                            <p className="font-medium">{infraRecommendations.hosting.primary}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Primary: {infraRecommendations.hosting.primary}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Alternatives: {infraRecommendations.hosting.alternatives.join(', ')}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Database className="h-4 w-4 mr-2" />
                            Database Solution
                          </h4>
                          <div className="p-4 border rounded-md">
                            <p className="font-medium">{infraRecommendations.database.primary}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Alternatives: {infraRecommendations.database.alternatives.join(', ')}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Zap className="h-4 w-4 mr-2" />
                            Caching Strategy
                          </h4>
                          <div className="p-4 border rounded-md">
                            <p className="font-medium">{infraRecommendations.caching.solution}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Strategy: {infraRecommendations.caching.strategy.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Monitor className="h-4 w-4 mr-2" />
                            Monitoring Solution
                          </h4>
                          <div className="p-4 border rounded-md">
                            <p className="font-medium">{infraRecommendations.monitoring.solution}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Metrics: {infraRecommendations.monitoring.metrics.join(', ')}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Cost Estimates
                          </h4>
                          <div className="p-4 border rounded-md">
                            <p className="font-medium">{costEstimates?.monthly_range}</p>
                            <div className="mt-2 space-y-1">
                              {Object.entries(costEstimates?.breakdown || {}).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                  <span className="capitalize">{key.replace('_', ' ')}:</span>
                                  <span>{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Shield className="h-4 w-4 mr-2" />
                            Security Measures
                          </h4>
                          <div className="p-4 border rounded-md">
                            <div className="flex flex-wrap gap-2">
                              {infraRecommendations.monitoring?.solution === 'comprehensive' && (
                                <>
                                  <Badge variant="secondary">SSL/TLS</Badge>
                                  <Badge variant="secondary">Firewall</Badge>
                                  <Badge variant="secondary">WAF</Badge>
                                  <Badge variant="secondary">DDoS Protection</Badge>
                                </>
                              )}
                              <Badge variant="secondary">Access Control</Badge>
                              <Badge variant="secondary">Audit Logging</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deployments" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Configurations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {savedConfigs.map((config) => (
                          <div key={config.id} className="p-3 border rounded-md">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{config.config_name}</p>
                                <p className="text-sm text-muted-foreground">{config.config_type}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{config.config_type}</Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadFile(config.config_content, config.config_name)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {savedConfigs.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">
                            No saved configurations yet
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Deployment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {deployments.map((deployment) => (
                          <div key={deployment.id} className="p-3 border rounded-md">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{deployment.deployment_target}</p>
                                <p className="text-sm text-muted-foreground">{deployment.deployment_type}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(deployment.started_at).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(deployment.deployment_status)}
                                <Badge variant="outline">{deployment.deployment_status}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                        {deployments.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">
                            No deployments yet
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendations.map((rec) => (
                        <div key={rec.id} className="p-4 border rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{rec.recommendation_type}</Badge>
                              <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${getConfidenceColor(rec.confidence_score)}`} />
                                <span className="text-sm text-muted-foreground">
                                  {Math.round(rec.confidence_score * 100)}% confidence
                                </span>
                              </div>
                            </div>
                            {rec.is_accepted && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm">
                            {rec.recommendation_data.primary || rec.recommendation_data.solution}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cpu className="h-5 w-5" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Engine</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Docker Service</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">CI/CD Pipeline</span>
                <Badge variant="default">Ready</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Infrastructure</span>
                <Badge variant="default">Analyzing</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export All Configs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Import Configs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Analyze your project structure to get personalized recommendations</p>
                <p>• Save configurations for reuse across projects</p>
                <p>• Use CI/CD pipelines for automated testing and deployment</p>
                <p>• Monitor deployment status in real-time</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
