import { Profile } from '../../entities/Profile';

export interface IProfileRepository {
  getProfile(userId: string): Promise<Profile | null>;
  createProfile(userId: string, theme?: string): Promise<Profile>;
  updateTheme(userId: string, theme: string): Promise<Profile>;
}
