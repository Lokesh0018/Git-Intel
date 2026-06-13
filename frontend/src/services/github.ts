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
    throw new Error(errorData.message || `GitHub API error: ${response.status}`);
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
  }
};
