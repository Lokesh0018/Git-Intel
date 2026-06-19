import { ProfileBundle } from './api';

const STORAGE_KEY = 'gitintel_candidates';
const SETTINGS_KEY = 'gitintel_settings';

export interface AppSettings {
  githubToken?: string;
}

import localforage from 'localforage';

export const storage = {
  async getCandidates(): Promise<ProfileBundle[]> {
    try {
      const data = await localforage.getItem<ProfileBundle[]>(STORAGE_KEY);
      return data || [];
    } catch (e) {
      console.error('Failed to get candidates from localforage', e);
      return [];
    }
  },

  async getCandidate(username: string): Promise<ProfileBundle | undefined> {
    const candidates = await this.getCandidates();
    return candidates.find(c => c.profile.username.toLowerCase() === username.toLowerCase());
  },

  async saveCandidate(candidate: ProfileBundle): Promise<void> {
    const candidates = await this.getCandidates();
    const existingIndex = candidates.findIndex(c => c.profile.username.toLowerCase() === candidate.profile.username.toLowerCase());
    
    if (existingIndex >= 0) {
      candidates[existingIndex] = candidate;
    } else {
      candidates.push(candidate);
    }
    
    await localforage.setItem(STORAGE_KEY, candidates);
  },

  async deleteCandidate(username: string): Promise<void> {
    const candidates = await this.getCandidates();
    const filtered = candidates.filter(c => c.profile.username.toLowerCase() !== username.toLowerCase());
    await localforage.setItem(STORAGE_KEY, filtered);
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
