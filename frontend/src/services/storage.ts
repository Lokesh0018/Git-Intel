import { ProfileBundle } from './api';

const STORAGE_KEY = 'gitintel_candidates';
const SETTINGS_KEY = 'gitintel_settings';

export interface AppSettings {
  githubToken?: string;
}

export const storage = {
  getCandidates(): ProfileBundle[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse candidates from local storage', e);
      return [];
    }
  },

  getCandidate(username: string): ProfileBundle | undefined {
    const candidates = this.getCandidates();
    return candidates.find(c => c.profile.username.toLowerCase() === username.toLowerCase());
  },

  saveCandidate(candidate: ProfileBundle): void {
    const candidates = this.getCandidates();
    const existingIndex = candidates.findIndex(c => c.profile.username.toLowerCase() === candidate.profile.username.toLowerCase());
    
    if (existingIndex >= 0) {
      candidates[existingIndex] = candidate;
    } else {
      candidates.push(candidate);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
  },

  deleteCandidate(username: string): void {
    const candidates = this.getCandidates();
    const filtered = candidates.filter(c => c.profile.username.toLowerCase() !== username.toLowerCase());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};
