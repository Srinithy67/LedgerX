import { Expense } from '../../entities/Expense';

export interface IExpenseRepository {
  listExpenses(
    userId: string,
    filters?: { categoryId?: string; startDate?: string; endDate?: string }
  ): Promise<Expense[]>;
  createExpense(userId: string, expense: Omit<Expense, 'id' | 'userId'>): Promise<Expense>;
  updateExpense(userId: string, id: string, expense: Partial<Omit<Expense, 'id' | 'userId'>>): Promise<Expense>;
  deleteExpense(userId: string, id: string): Promise<void>;
  getExpense(userId: string, id: string): Promise<Expense | null>;
}
