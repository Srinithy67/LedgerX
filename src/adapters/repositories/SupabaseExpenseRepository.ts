import { supabase } from '../../config/supabase';
import { Expense } from '../../core/entities/Expense';
import { IExpenseRepository } from '../../core/usecases/repositories/IExpenseRepository';
import { AppError, NotFoundError } from '../../core/errors/AppError';

export class SupabaseExpenseRepository implements IExpenseRepository {
  async listExpenses(
    userId: string,
    filters?: { categoryId?: string; startDate?: string; endDate?: string }
  ): Promise<Expense[]> {
    let query = supabase
      .from('expenses')
      .select('*, categories(name, category_group)')
      .eq('user_id', userId);

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }

    // Sort by transaction date descending
    query = query.order('date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new AppError(`Database error: ${error.message}`, 500);
    }

    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      amount: parseFloat(row.amount),
      description: row.description || '',
      categoryId: row.category_id,
      paymentMethod: row.payment_method,
      date: new Date(row.date),
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      category: row.categories
        ? {
            name: row.categories.name,
            categoryGroup: row.categories.category_group,
          }
        : undefined,
    }));
  }

  async createExpense(userId: string, expense: Omit<Expense, 'id' | 'userId'>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        amount: expense.amount,
        description: expense.description,
        category_id: expense.categoryId,
        payment_method: expense.paymentMethod,
        date: expense.date.toISOString(),
      })
      .select('*, categories(name, category_group)')
      .single();

    if (error) {
      throw new AppError(`Database error: ${error.message}`, 500);
    }

    return {
      id: data.id,
      userId: data.user_id,
      amount: parseFloat(data.amount),
      description: data.description || '',
      categoryId: data.category_id,
      paymentMethod: data.payment_method,
      date: new Date(data.date),
      createdAt: new Date(data.created_at),
      category: data.categories
        ? {
            name: data.categories.name,
            categoryGroup: data.categories.category_group,
          }
        : undefined,
    };
  }

  async updateExpense(
    userId: string,
    id: string,
    expense: Partial<Omit<Expense, 'id' | 'userId'>>
  ): Promise<Expense> {
    const existing = await this.getExpense(userId, id);
    if (!existing) {
      throw new NotFoundError('Expense record not found');
    }

    const updates: Record<string, any> = {};
    if (expense.amount !== undefined) updates.amount = expense.amount;
    if (expense.description !== undefined) updates.description = expense.description;
    if (expense.categoryId !== undefined) updates.category_id = expense.categoryId;
    if (expense.paymentMethod !== undefined) updates.payment_method = expense.paymentMethod;
    if (expense.date !== undefined) updates.date = expense.date.toISOString();

    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, categories(name, category_group)')
      .single();

    if (error) {
      throw new AppError(`Database error: ${error.message}`, 500);
    }

    return {
      id: data.id,
      userId: data.user_id,
      amount: parseFloat(data.amount),
      description: data.description || '',
      categoryId: data.category_id,
      paymentMethod: data.payment_method,
      date: new Date(data.date),
      createdAt: new Date(data.created_at),
      category: data.categories
        ? {
            name: data.categories.name,
            categoryGroup: data.categories.category_group,
          }
        : undefined,
    };
  }

  async deleteExpense(userId: string, id: string): Promise<void> {
    const existing = await this.getExpense(userId, id);
    if (!existing) {
      throw new NotFoundError('Expense record not found');
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new AppError(`Database error: ${error.message}`, 500);
    }
  }

  async getExpense(userId: string, id: string): Promise<Expense | null> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, categories(name, category_group)')
      .eq('id', id)
      .eq('user_id', userId)
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
      amount: parseFloat(data.amount),
      description: data.description || '',
      categoryId: data.category_id,
      paymentMethod: data.payment_method,
      date: new Date(data.date),
      createdAt: new Date(data.created_at),
      category: data.categories
        ? {
            name: data.categories.name,
            categoryGroup: data.categories.category_group,
          }
        : undefined,
    };
  }
}
