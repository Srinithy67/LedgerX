import { supabase } from '../../config/supabase';
import { Category, CategoryGroup } from '../../core/entities/Category';
import { ICategoryRepository } from '../../core/usecases/repositories/ICategoryRepository';
import { AppError, NotFoundError } from '../../core/errors/AppError';

export class SupabaseCategoryRepository implements ICategoryRepository {
  async listCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .order('is_custom', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      throw new AppError(`Database error: ${error.message}`, 500);
    }

    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      isCustom: row.is_custom,
      categoryGroup: row.category_group as CategoryGroup,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
    }));
  }

  async createCategory(userId: string, name: string, categoryGroup: CategoryGroup): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name,
        is_custom: true,
        category_group: categoryGroup,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new AppError(`Category with name "${name}" already exists`, 400);
      }
      throw new AppError(`Database error: ${error.message}`, 500);
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      isCustom: data.is_custom,
      categoryGroup: data.category_group as CategoryGroup,
      createdAt: new Date(data.created_at),
    };
  }

  async updateCategory(
    userId: string,
    id: string,
    name?: string,
    categoryGroup?: CategoryGroup
  ): Promise<Category> {
    // Verify user owns the category
    const existing = await this.findById(userId, id);
    if (!existing) {
      throw new NotFoundError('Category not found or you do not have permission to edit it');
    }
    if (!existing.isCustom) {
      throw new AppError('Cannot update system-defined categories', 400);
    }

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (categoryGroup !== undefined) updates.category_group = categoryGroup;

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new AppError(`Category with name "${name}" already exists`, 400);
      }
      throw new AppError(`Database error: ${error.message}`, 500);
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      isCustom: data.is_custom,
      categoryGroup: data.category_group as CategoryGroup,
      createdAt: new Date(data.created_at),
    };
  }

  async deleteCategory(userId: string, id: string): Promise<void> {
    // Verify user owns the category
    const existing = await this.findById(userId, id);
    if (!existing) {
      throw new NotFoundError('Category not found or you do not have permission to delete it');
    }
    if (!existing.isCustom) {
      throw new AppError('Cannot delete system-defined categories', 400);
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new AppError(`Database error: ${error.message}`, 500);
    }
  }

  async findByName(userId: string, name: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('name', name)
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .limit(1);

    if (error) {
      throw new AppError(`Database error: ${error.message}`, 500);
    }

    if (!data || data.length === 0) {
      return null;
    }

    const row = data[0];
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      isCustom: row.is_custom,
      categoryGroup: row.category_group as CategoryGroup,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
    };
  }

  async findById(userId: string, id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new AppError(`Database error: ${error.message}`, 500);
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      isCustom: data.is_custom,
      categoryGroup: data.category_group as CategoryGroup,
      createdAt: new Date(data.created_at),
    };
  }
}
