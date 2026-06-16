import { Profile } from '../../core/entities/Profile';
import { IProfileRepository } from '../../core/usecases/repositories/IProfileRepository';

const profiles = new Map<string, Profile>();

export class MemoryProfileRepository implements IProfileRepository {
  async getProfile(userId: string): Promise<Profile | null> {
    return profiles.get(userId) ?? null;
  }

  async createProfile(userId: string, theme = 'Matcha Strawberry'): Promise<Profile> {
    const profile: Profile = {
      id: userId,
      theme,
      updatedAt: new Date(),
    };
    profiles.set(userId, profile);
    return profile;
  }

  async updateTheme(userId: string, theme: string): Promise<Profile> {
    const existing = profiles.get(userId);
    if (!existing) {
      return this.createProfile(userId, theme);
    }
    const updated: Profile = { ...existing, theme, updatedAt: new Date() };
    profiles.set(userId, updated);
    return updated;
  }
}
