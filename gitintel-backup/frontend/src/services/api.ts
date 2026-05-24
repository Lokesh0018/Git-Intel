const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export type EvidenceItem = {
  label: string;
  value: string | number;
  repositories?: string[];
};

export type ScoreCategory = {
  score: number;
  evidence: EvidenceItem[];
};

export type ProfileBundle = {
  profile: {
    username: string;
    avatarUrl: string;
    name?: string;
    bio?: string;
    followers: number;
    following: number;
    publicRepos: number;
    analyzedAt: string;
    shareToken: string;
  };
  repositories: Array<{
    name: string;
    fullName: string;
    description?: string;
    language?: string;
    stars: number;
    forks: number;
    commits: number;
    technologies: string[];
    complexityScore: number;
    projectType: string;
    summary: string;
    evidence: EvidenceItem[];
    pushedAt?: string;
  }>;
  scores: Record<string, ScoreCategory>;
  insights: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendedRoles: Array<{
      role: string;
      matchPercentage: number;
      evidence: string[];
      recommendations: string[];
    }>;
  };
};

export type JobMatch = {
  matchPercentage: number;
  requiredSkills: string[];
  technologies: string[];
  strengths: string[];
  missingSkills: string[];
  hiringRecommendation: string;
};

function token() {
  return localStorage.getItem('gitintel_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message ?? 'Request failed');
  return data as T;
}

export const api = {
  async register(email: string, password: string) {
    const result = await request<{ token: string; user: { email: string } }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('gitintel_token', result.token);
    localStorage.setItem('gitintel_email', result.user.email);
    return result;
  },
  async login(email: string, password: string) {
    const result = await request<{ token: string; user: { email: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('gitintel_token', result.token);
    localStorage.setItem('gitintel_email', result.user.email);
    return result;
  },
  analyze(username: string) {
    return request<ProfileBundle>('/api/analyze', { method: 'POST', body: JSON.stringify({ username }) });
  },
  profile(usernameOrToken: string) {
    return request<ProfileBundle>(`/api/profile/${encodeURIComponent(usernameOrToken)}`);
  },
  jobMatch(username: string, jobDescription: string) {
    return request<JobMatch>('/api/job-match', { method: 'POST', body: JSON.stringify({ username, jobDescription }) });
  },
  report(username: string) {
    return request<ProfileBundle>(`/api/report/${encodeURIComponent(username)}`);
  }
};
