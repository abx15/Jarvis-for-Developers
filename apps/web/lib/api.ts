import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  session_token: string;
  token_type: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface UserUpdate {
  name?: string;
  avatar?: string;
}

export interface GitHubOAuthData {
  code: string;
  state: string;
}

export interface GitHubOAuthResponse {
  authorization_url: string;
  state: string;
}

export interface ConnectedAccount {
  id: number;
  provider: string;
  provider_account_id: string;
  created_at: string;
}

export interface GestureDetectRequest {
  gesture: string
  confidence?: number
  meta?: Record<string, any>
}

export interface GestureActionRequest {
  action: string
  payload?: Record<string, any>
}

// API Client Class
class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: any) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              this.setToken(response.access_token);
              originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token);
    }
  }

  private setSessionToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('session_token', token);
    }
  }

  public clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('session_token');
      localStorage.removeItem('user');
    }
  }

  private storeAuthData(response: AuthResponse): void {
    this.setToken(response.access_token);
    this.setRefreshToken(response.refresh_token);
    this.setSessionToken(response.session_token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
  }

  // Authentication methods
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.client.post(
        '/api/v1/auth/register',
        data
      );
      this.storeAuthData(response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.client.post(
        '/api/v1/auth/login',
        data
      );
      this.storeAuthData(response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response: AxiosResponse<TokenResponse> = await this.client.post(
        '/api/v1/auth/refresh',
        { refresh_token: refreshToken }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await this.client.get('/api/v1/auth/me');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(data: UserUpdate): Promise<User> {
    try {
      const response: AxiosResponse<User> = await this.client.put(
        '/api/v1/auth/me',
        data
      );
      // Update stored user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyToken(): Promise<{ valid: boolean; user_id?: string }> {
    try {
      const response = await this.client.post('/api/v1/auth/verify-token');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // GitHub OAuth methods
  async getGitHubOAuthUrl(): Promise<GitHubOAuthResponse> {
    try {
      const response: AxiosResponse<GitHubOAuthResponse> = await this.client.get(
        '/api/v1/auth/github/login'
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async handleGitHubCallback(data: GitHubOAuthData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.client.post(
        '/api/v1/auth/github/callback',
        data
      );
      this.storeAuthData(response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async disconnectGitHub(): Promise<{ message: string }> {
    try {
      const response = await this.client.delete('/api/v1/auth/github/disconnect');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getConnectedAccounts(): Promise<{ accounts: ConnectedAccount[] }> {
    try {
      const response = await this.client.get('/api/v1/auth/accounts');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility methods
  getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Repository methods
  async connectRepo(owner: string, repoName: string, description: string = ''): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/repo/connect', {
        owner,
        repo_name: repoName,
        description,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async indexRepo(repoId: number): Promise<any> {
    try {
      const response = await this.client.post(`/api/v1/repo/${repoId}/index`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async listRepos(): Promise<any> {
    try {
      const response = await this.client.get('/api/v1/repo/list');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRepoFiles(repoId: number): Promise<any> {
    try {
      const response = await this.client.get(`/api/v1/repo/${repoId}/files`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchRepo(repoId: number, query: string): Promise<any> {
    try {
      const response = await this.client.post(`/api/v1/repo/${repoId}/search`, { query });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // AI Agent methods
  async runAgent(task: string, repoId?: number): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/agents/run', { task, repo_id: repoId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async runCodeAgent(task: string, repoId?: number): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/agents/code', { task, repo_id: repoId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async runDebugAgent(task: string, repoId?: number): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/agents/debug', { task, repo_id: repoId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async runRefactorAgent(task: string, repoId?: number): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/agents/refactor', { task, repo_id: repoId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async runTestAgent(task: string, repoId?: number): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/agents/tests', { task, repo_id: repoId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // AutoCode methods
  async getCodePlan(prompt: string, repoId?: number): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/autocode/plan', { prompt, repo_id: repoId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async executeCodeStep(step: any, repoId?: number): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/autocode/execute', step, { params: { repo_id: repoId } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async applyCodeChanges(changes: { path: string, content: string }[]): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/autocode/apply', changes);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Gesture methods
  async gestureDetect(request: GestureDetectRequest): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/gesture/detect', request)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async gestureAction(request: GestureActionRequest): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/gesture/action', request)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Analytics methods
  async getAnalyticsOverview(): Promise<any> {
    try {
      const response = await this.client.get('/api/v1/analytics/overview')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getRepoHealth(repoId: number): Promise<any> {
    try {
      const response = await this.client.get(`/api/v1/analytics/repo-health/${repoId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async trackEvent(eventType: string, eventData: Record<string, any> = {}): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/analytics/track', { event_type: eventType, ...eventData })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Editor methods
  async getRepositoryFiles(repoId: number): Promise<any> {
    try {
      const response = await this.client.get(`/api/v1/repo/${repoId}/files`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async saveFile(repoId: number, filePath: string, content: string): Promise<any> {
    try {
      const response = await this.client.post(`/api/v1/repo/${repoId}/update-file`, { file_path: filePath, content })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getEditorSuggestions(repoId: number, data: any): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/editor/suggest', data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async refactorCode(data: any): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/editor/refactor', data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async explainCode(data: any): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/editor/explain', data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // GitHub methods
  async listRepositories(): Promise<any> {
    try {
      const response = await this.client.get('/api/v1/repo/list')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getPullRequests(repoId: number): Promise<any> {
    try {
      const response = await this.client.get(`/api/v1/github/pull-requests/${repoId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async reviewPR(repoId: number, prNumber: number): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/github/review-pr', { repo_id: repoId, pr_number: prNumber })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async analyzeIssue(repoId: number, issueData: any): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/github/analyze-issue', { repo_id: repoId, ...issueData })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // AI Bug methods
  async scanRepo(repoId: number): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/ai/scan-repo', { repo_id: repoId })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getBugs(repoId: number): Promise<any> {
    try {
      const response = await this.client.get(`/api/v1/ai/bugs/${repoId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getBugDetails(bugId: number): Promise<any> {
    try {
      const response = await this.client.get(`/api/v1/ai/bug/${bugId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async autoFix(bugId: number): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/ai/auto-fix', { bug_id: bugId })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Multi-Agent methods
  async runAgentTask(repoId: number, task: string): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/agents/task', { repo_id: repoId, task })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getAgentHistory(): Promise<any> {
    try {
      const response = await this.client.get('/api/v1/agents/history')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Billing methods
  async createSubscription(planType: string): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/billing/create-subscription', { plan_type: planType });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSubscription(planType: string): Promise<any> {
    try {
      const response = await this.client.put('/api/v1/billing/update-subscription', { plan_type: planType });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelSubscription(atPeriodEnd: boolean = true): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/billing/cancel-subscription', { at_period_end: atPeriodEnd });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSubscription(): Promise<any> {
    try {
      const response = await this.client.get('/api/v1/billing/subscription');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUsageStats(): Promise<any> {
    try {
      const response = await this.client.get('/api/v1/billing/usage');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAvailablePlans(): Promise<any[]> {
    try {
      const response = await this.client.get('/api/v1/billing/plans');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBillingInvoices(): Promise<any[]> {
    try {
      const response = await this.client.get('/api/v1/billing/invoices');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createBillingPortalSession(): Promise<{ portal_url: string }> {
    try {
      const response = await this.client.post('/api/v1/billing/billing-portal');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.detail || error.response.data?.message || 'Server error';
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export individual methods for convenience
export const {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  updateProfile,
  verifyToken,
  getGitHubOAuthUrl,
  handleGitHubCallback,
  disconnectGitHub,
  getConnectedAccounts,
  getStoredUser,
  isAuthenticated,
  clearTokens,
  connectRepo,
  indexRepo,
  listRepos,
  getRepoFiles,
  searchRepo,
  runAgent,
  runCodeAgent,
  runDebugAgent,
  runRefactorAgent,
  runTestAgent,
  getCodePlan,
  executeCodeStep,
  applyCodeChanges,
  gestureDetect,
  gestureAction,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getSubscription,
  getUsageStats,
  getAvailablePlans,
  getBillingInvoices,
  createBillingPortalSession,
} = apiClient;

export default apiClient;
