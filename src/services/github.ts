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

  const MAX_RETRIES = 3;
  let attempt = 0;
  
  while (attempt < MAX_RETRIES) {
    try {
      const response = await fetch(`${GITHUB_API_URL}${endpoint}`, { headers });
      
      if (!response.ok) {
        // Do not retry 4xx errors, except maybe 429 if we wanted to (but we already handle rate limits gracefully)
        if (response.status < 500) {
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
        throw new Error(`Server error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      attempt++;
      if (attempt >= MAX_RETRIES || error.message.includes('|RESET:')) {
        throw error;
      }
      // Exponential backoff
      await new Promise(res => setTimeout(res, 500 * Math.pow(2, attempt - 1)));
    }
  }
  
  throw new Error('Failed to fetch after retries');
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
