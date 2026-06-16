import { supabase } from '../../config/supabase';
import { Profile } from '../../core/entities/Profile';
import { IProfileRepository } from '../../core/usecases/repositories/IProfileRepository';
import { AppError } from '../../core/errors/AppError';

export class SupabaseProfileRepository implements IProfileRepository {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return null;
      }
      throw new AppError(`Database error: ${error.message}`, 500);
    }

    return {
      id: data.id,
      theme: data.theme,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    };
  }

  async createProfile(userId: string, theme = 'Matcha Strawberry'): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, theme, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      throw new AppError(`Database error: ${error.message}`, 500);
    }

    return {
      id: data.id,
      theme: data.theme,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    };
  }

  async updateTheme(userId: string, theme: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ theme, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new AppError(`Database error: ${error.message}`, 500);
    }

    return {
      id: data.id,
      theme: data.theme,
      updatedAt: new Date(data.updated_at),
    };
  }
}
