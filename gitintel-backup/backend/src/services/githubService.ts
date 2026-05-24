import { env } from '../config/env.js';
import { MemoryCache } from '../utils/cache.js';
import { HttpError } from '../utils/httpError.js';

const cache = new MemoryCache(env.CACHE_TTL_SECONDS);

type GithubUser = {
  login: string;
  avatar_url: string;
  name?: string;
  bio?: string;
  followers: number;
  following: number;
  public_repos: number;
};

export type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  language?: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  topics?: string[];
  pushed_at?: string;
  default_branch: string;
  fork: boolean;
};

export type RepoSignals = {
  readme?: string;
  packageJson?: Record<string, unknown>;
  files: string[];
  languages: Record<string, number>;
  commits: number;
  pulls: number;
  mergedPulls: number;
  issues: number;
};

async function githubFetch<T>(path: string, attempt = 1): Promise<T> {
  const cached = cache.get<T>(path);
  if (cached) return cached;

  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {})
    }
  });

  if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
    throw new HttpError(429, 'GitHub API rate limit exceeded. Configure GITHUB_TOKEN for higher limits.');
  }

  if (response.status >= 500 && attempt < 3) {
    await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    return githubFetch<T>(path, attempt + 1);
  }

  if (!response.ok) {
    throw new HttpError(response.status, `GitHub request failed for ${path}`);
  }

  const data = (await response.json()) as T;
  cache.set(path, data);
  return data;
}

async function optionalGithubFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    return await githubFetch<T>(path);
  } catch {
    return fallback;
  }
}

export const githubService = {
  async getUser(username: string) {
    return githubFetch<GithubUser>(`/users/${encodeURIComponent(username)}`);
  },

  async getRepositories(username: string) {
    const repos = await githubFetch<GithubRepo[]>(
      `/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&type=owner`
    );
    return repos.filter((repo) => !repo.fork).slice(0, 24);
  },

  async getRepoSignals(repo: GithubRepo): Promise<RepoSignals> {
    const encodedFullName = repo.full_name
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/');

    const [languages, contents, commits, pulls, issues] = await Promise.all([
      optionalGithubFetch<Record<string, number>>(`/repos/${encodedFullName}/languages`, {}),
      optionalGithubFetch<Array<{ name: string; type: string }>>(`/repos/${encodedFullName}/contents`, []),
      optionalGithubFetch<unknown[]>(`/repos/${encodedFullName}/commits?per_page=100`, []),
      optionalGithubFetch<Array<{ merged_at?: string | null }>>(`/repos/${encodedFullName}/pulls?state=all&per_page=100`, []),
      optionalGithubFetch<unknown[]>(`/repos/${encodedFullName}/issues?state=all&per_page=100`, [])
    ]);

    const readmeResponse = await optionalGithubFetch<{ content?: string; encoding?: string }>(
      `/repos/${encodedFullName}/readme`,
      {}
    );
    const readme =
      readmeResponse.content && readmeResponse.encoding === 'base64'
        ? Buffer.from(readmeResponse.content, 'base64').toString('utf8').slice(0, 12000)
        : undefined;

    const packageFile = await optionalGithubFetch<{ content?: string; encoding?: string }>(
      `/repos/${encodedFullName}/contents/package.json`,
      {}
    );
    let packageJson: Record<string, unknown> | undefined;
    if (packageFile.content && packageFile.encoding === 'base64') {
      try {
        packageJson = JSON.parse(Buffer.from(packageFile.content, 'base64').toString('utf8'));
      } catch {
        packageJson = undefined;
      }
    }

    return {
      readme,
      packageJson,
      languages,
      files: contents.filter((file) => file.type === 'file').map((file) => file.name),
      commits: commits.length,
      pulls: pulls.length,
      mergedPulls: pulls.filter((pull) => pull.merged_at).length,
      issues: issues.length
    };
  }
};
