import { supabase } from '../../config/supabase';
import { IProfileRepository } from './repositories/IProfileRepository';
import { Profile } from '../entities/Profile';
import { AppError, ValidationError } from '../errors/AppError';
import { registerSchema, loginSchema, themeUpdateSchema } from '../validation/schemas';

export class AuthService {
  constructor(private profileRepo: IProfileRepository) {}

  async register(email: string, password: string) {
    const parse = registerSchema.safeParse({ email, password });
    if (!parse.success) {
      throw new ValidationError(parse.error.errors[0].message);
    }

    // Call Supabase Auth to register user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new AppError(error.message, 400);
    }

    if (!data.user) {
      throw new AppError('Registration failed, no user returned', 500);
    }

    // A trigger in Supabase (on_auth_user_created) creates the profile row automatically.
    // If running in mocked test environment, we might manually insert. Let's make it safe:
    let profile = await this.profileRepo.getProfile(data.user.id);
    if (!profile) {
      profile = await this.profileRepo.createProfile(data.user.id);
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      profile,
      session: data.session ? {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      } : null,
    };
  }

  async login(email: string, password: string) {
    const parse = loginSchema.safeParse({ email, password });
    if (!parse.success) {
      throw new ValidationError(parse.error.errors[0].message);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!data.user || !data.session) {
      throw new AppError('Login failed, session not created', 500);
    }

    let profile = await this.profileRepo.getProfile(data.user.id);
    if (!profile) {
      profile = await this.profileRepo.createProfile(data.user.id);
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      profile,
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
    };
  }

  async refreshSession(refreshToken: string) {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error || !data.session) {
      throw new AppError('Unable to refresh session — please log in again', 401);
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    };
  }

  async getProfile(userId: string): Promise<Profile> {
    const profile = await this.profileRepo.getProfile(userId);
    if (!profile) {
      // Create if missing (failsafe)
      return this.profileRepo.createProfile(userId);
    }
    return profile;
  }

  async updateTheme(userId: string, theme: string): Promise<Profile> {
    const parse = themeUpdateSchema.safeParse({ theme });
    if (!parse.success) {
      throw new ValidationError(parse.error.errors[0].message);
    }

    return this.profileRepo.updateTheme(userId, theme);
  }
}
