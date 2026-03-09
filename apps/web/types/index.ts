// Global type definitions for AI Developer OS

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  session_token: string;
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

export interface Repository {
  id: number;
  user_id: number;
  repo_name: string;
  repo_url: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface File {
  id: number;
  repo_id: number;
  file_path: string;
  content: string;
  language?: string;
  created_at: string;
}

export interface CodeChunk {
  id: number;
  file_id: number;
  chunk_text: string;
  start_line?: number;
  end_line?: number;
}

export interface VoiceCommand {
  id: string;
  command: string;
  transcript: string;
  response: string;
  confidence: number;
  created_at: string;
}

export interface VisionAnalysis {
  id: string;
  image_url: string;
  analysis_type: string;
  confidence: number;
  objects: string[];
  code?: string;
  insights: string[];
  created_at: string;
}

export interface AnalyticsData {
  total_users: number;
  active_users_today: number;
  total_requests_today: number;
  average_response_time: number;
  service_health: Record<string, string>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Component Props Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Hook Types
export interface UseAuthReturn {
  user: User | null;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: UserUpdate) => Promise<User>;
  refreshUser: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | undefined;
  };
  options?: Array<{ value: string; label: string }>;
}

export interface FormData {
  [key: string]: any;
}

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    ring: string;
  };
  borderRadius: string;
  fontFamily: string;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
  badge?: string | number;
  children?: NavItem[];
}

// Feature Types
export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  href: string;
}

// Activity Types
export interface Activity {
  id: string;
  type: 'repository' | 'code' | 'vision' | 'voice' | 'user';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<any>;
  color: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}
