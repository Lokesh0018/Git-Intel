import { storage } from './storage';

const GITHUB_API_URL = 'https://api.github.com';

async function fetchGithub<T>(endpoint: string): Promise<T> {
  const settings = storage.getSettings();
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  if (settings.githubToken) {
    headers['Authorization'] = `token ${settings.githubToken}`;
  }

  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, { headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = errorData.message || `GitHub API error: ${response.status}`;
    
    if (response.status === 403 || response.status === 429) {
      const resetTime = response.headers.get('x-ratelimit-reset');
      if (resetTime) {
        errorMessage += `|RESET:${resetTime}`;
      }
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export const githubService = {
  async getUserProfile(username: string) {
    return fetchGithub<any>(`/users/${username}`);
  },

  async getUserRepositories(username: string) {
    // Fetch up to 100 repositories to get a good sample for analysis
    return fetchGithub<any[]>(`/users/${username}/repos?per_page=100&sort=pushed&direction=desc`);
  },
  
  async getLanguages(username: string, repo: string) {
    return fetchGithub<Record<string, number>>(`/repos/${username}/${repo}/languages`);
  },

  async getPackageJson(username: string, repo: string) {
    try {
      const response = await fetchGithub<any>(`/repos/${username}/${repo}/contents/package.json`);
      if (response && response.content) {
        const decoded = decodeURIComponent(escape(atob(response.content.replace(/\n/g, ''))));
        return JSON.parse(decoded);
      }
    } catch (e) {
      // Ignore errors if package.json does not exist
    }
    return null;
  }
};
