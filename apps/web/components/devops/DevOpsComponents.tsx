import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Upload, 
  Copy, 
  Check, 
  AlertCircle,
  Play,
  Pause,
  Settings,
  Trash2
} from 'lucide-react';

interface DockerfileGeneratorProps {
  projectInfo: any;
  dockerfile: string;
  dockerCompose?: string;
  optimizations: string[];
  onSave: () => void;
  onDownload: (content: string, filename: string) => void;
  loading: boolean;
}

export function DockerfileGenerator({
  projectInfo,
  dockerfile,
  dockerCompose,
  optimizations,
  onSave,
  onDownload,
  loading
}: DockerfileGeneratorProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Generated Dockerfile</span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(dockerfile)}
                disabled={!dockerfile}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                disabled={!dockerfile || loading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(dockerfile, 'Dockerfile')}
                disabled={!dockerfile}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardTitle>
          {projectInfo && (
            <CardDescription>
              Framework: {projectInfo.framework} | Language: {projectInfo.language} | 
              Port: {projectInfo.port || 'N/A'}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {dockerfile ? (
            <div className="space-y-4">
              <ScrollArea className="h-96 w-full border rounded-md p-4">
                <pre className="text-sm font-mono bg-muted p-2 rounded">{dockerfile}</pre>
              </ScrollArea>
              {optimizations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Optimizations Applied:</h4>
                  <div className="flex flex-wrap gap-2">
                    {optimizations.map((opt, index) => (
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
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
                onClick={() => onDownload(dockerCompose, 'docker-compose.yml')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 w-full border rounded-md p-4">
              <pre className="text-sm font-mono bg-muted p-2 rounded">{dockerCompose}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface CICDPipelineViewerProps {
  platform: string;
  pipelineContent: string;
  deploymentManifests: Record<string, string>;
  onSave: () => void;
  onDownload: (content: string, filename: string) => void;
  loading: boolean;
}

export function CICDPipelineViewer({
  platform,
  pipelineContent,
  deploymentManifests,
  onSave,
  onDownload,
  loading
}: CICDPipelineViewerProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{platform.toUpperCase()} Pipeline</span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(pipelineContent)}
                disabled={!pipelineContent}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                disabled={!pipelineContent || loading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(pipelineContent, `${platform}-pipeline.yml`)}
                disabled={!pipelineContent}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pipelineContent ? (
            <ScrollArea className="h-96 w-full border rounded-md p-4">
              <pre className="text-sm font-mono bg-muted p-2 rounded">{pipelineContent}</pre>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Generate a CI/CD pipeline by selecting a platform</p>
            </div>
          )}
        </CardContent>
      </Card>

      {Object.keys(deploymentManifests).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kubernetes Manifests</CardTitle>
            <CardDescription>Generated Kubernetes deployment files</CardDescription>
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
                      onClick={() => onDownload(content, filename)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <ScrollArea className="h-32 w-full border rounded-md p-2">
                    <pre className="text-xs font-mono bg-muted p-1 rounded">{content}</pre>
                  </ScrollArea>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface InfraSuggestionPanelProps {
  recommendations: any;
  costEstimates: any;
  onAcceptRecommendation: (type: string) => void;
}

export function InfraSuggestionPanel({
  recommendations,
  costEstimates,
  onAcceptRecommendation
}: InfraSuggestionPanelProps) {
  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      'aws': '☁️',
      'azure': '☁️',
      'gcp': '☁️',
      'heroku': '🟣',
      'vercel': '▲',
      'netlify': '🟦'
    };
    return icons[platform] || '☁️';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>☁️</span>
              <span>Hosting Platform</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getPlatformIcon(recommendations.hosting?.primary)}</span>
                    <span className="font-medium">{recommendations.hosting?.primary}</span>
                  </div>
                  <Badge variant="default">Recommended</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {recommendations.hosting?.reasoning?.[0]}
                </p>
                <Button
                  size="sm"
                  onClick={() => onAcceptRecommendation('hosting')}
                  className="w-full"
                >
                  Accept Recommendation
                </Button>
              </div>
              
              {recommendations.hosting?.alternatives?.map((alt: string, index: number) => (
                <div key={index} className="p-3 border rounded-md opacity-75">
                  <div className="flex items-center space-x-2">
                    <span>{getPlatformIcon(alt)}</span>
                    <span className="font-medium">{alt}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>💾</span>
              <span>Database Solution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{recommendations.database?.primary}</span>
                <Badge variant="outline">Database</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Best for: {recommendations.database?.reasoning?.[0]}
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {recommendations.database?.hosting?.map((host: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {host}
                  </Badge>
                ))}
              </div>
              <Button
                size="sm"
                onClick={() => onAcceptRecommendation('database')}
                className="w-full"
              >
                Accept Recommendation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>⚡</span>
              <span>Caching Strategy</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{recommendations.caching?.solution}</span>
                <Badge variant="outline">Cache</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {recommendations.caching?.reasoning?.[0]}
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {recommendations.caching?.strategy?.map((strategy: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {strategy}
                  </Badge>
                ))}
              </div>
              <Button
                size="sm"
                onClick={() => onAcceptRecommendation('caching')}
                className="w-full"
              >
                Accept Recommendation
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📊</span>
              <span>Monitoring Solution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{recommendations.monitoring?.solution}</span>
                <Badge variant="outline">Monitoring</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {recommendations.monitoring?.reasoning?.[0]}
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {recommendations.monitoring?.metrics?.slice(0, 3).map((metric: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {metric}
                  </Badge>
                ))}
              </div>
              <Button
                size="sm"
                onClick={() => onAcceptRecommendation('monitoring')}
                className="w-full"
              >
                Accept Recommendation
              </Button>
            </div>
          </CardContent>
        </Card>

        {costEstimates && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>💰</span>
                <span>Cost Estimates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-md">
                <div className="text-2xl font-bold mb-2">{costEstimates.monthly_range}</div>
                <div className="space-y-2">
                  {Object.entries(costEstimates.breakdown || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace('_', ' ')}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface DeploymentStatusProps {
  deployments: any[];
  onCancel: (id: number) => void;
  onRetry: (id: number) => void;
}

export function DeploymentStatus({ deployments, onCancel, onRetry }: DeploymentStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Pause className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deployment Status</CardTitle>
        <CardDescription>Monitor your deployment progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deployments.map((deployment) => (
            <div key={deployment.id} className="p-4 border rounded-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(deployment.deployment_status)}
                  <div>
                    <p className="font-medium">{deployment.deployment_target}</p>
                    <p className="text-sm text-muted-foreground">{deployment.deployment_type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(deployment.deployment_status)}>
                    {deployment.deployment_status}
                  </Badge>
                  {deployment.deployment_status === 'running' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCancel(deployment.id)}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  {deployment.deployment_status === 'failed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRetry(deployment.id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Started: {new Date(deployment.started_at).toLocaleString()}
                {deployment.completed_at && (
                  <span className="ml-4">
                    Completed: {new Date(deployment.completed_at).toLocaleString()}
                  </span>
                )}
              </div>
              {deployment.deployment_log && (
                <div className="mt-2">
                  <Separator />
                  <ScrollArea className="h-20 w-full mt-2">
                    <pre className="text-xs font-mono bg-muted p-2 rounded">
                      {deployment.deployment_log}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          ))}
          {deployments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No deployments yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ConfigManagerProps {
  configs: any[];
  onLoad: (config: any) => void;
  onDelete: (id: number) => void;
  onExport: (configs: any[]) => void;
}

export function ConfigManager({ configs, onLoad, onDelete, onExport }: ConfigManagerProps) {
  const getConfigIcon = (type: string) => {
    switch (type) {
      case 'dockerfile':
        return '🐳';
      case 'cicd':
        return '🔄';
      case 'infrastructure':
        return '🏗️';
      case 'kubernetes':
        return '☸️';
      default:
        return '📄';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Saved Configurations</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport(configs)}
            disabled={configs.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {configs.map((config) => (
            <div key={config.id} className="p-3 border rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getConfigIcon(config.config_type)}</span>
                  <div>
                    <p className="font-medium">{config.config_name}</p>
                    <p className="text-sm text-muted-foreground">{config.config_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(config.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{config.config_type}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLoad(config)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(config.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {configs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No saved configurations yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
