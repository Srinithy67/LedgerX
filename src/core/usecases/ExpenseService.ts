import { IExpenseRepository } from './repositories/IExpenseRepository';
import { ICategoryRepository } from './repositories/ICategoryRepository';
import { Expense } from '../entities/Expense';
import { NotFoundError, ValidationError } from '../errors/AppError';
import { expenseCreateSchema, expenseUpdateSchema } from '../validation/schemas';

export class ExpenseService {
  constructor(
    private expenseRepo: IExpenseRepository,
    private categoryRepo: ICategoryRepository
  ) {}

  async listExpenses(
    userId: string,
    filters?: { categoryId?: string; startDate?: string; endDate?: string }
  ): Promise<Expense[]> {
    return this.expenseRepo.listExpenses(userId, filters);
  }

  async createExpense(userId: string, expenseInput: Omit<Expense, 'id' | 'userId'>): Promise<Expense> {
    const parse = expenseCreateSchema.safeParse(expenseInput);
    if (!parse.success) {
      throw new ValidationError(parse.error.errors[0].message);
    }

    // Validate category exists and is accessible
    if (expenseInput.categoryId) {
      const category = await this.categoryRepo.findById(userId, expenseInput.categoryId);
      if (!category) {
        throw new NotFoundError('Category not found or inaccessible');
      }
    }

    return this.expenseRepo.createExpense(userId, expenseInput);
  }

  async updateExpense(
    userId: string,
    id: string,
    expenseInput: Partial<Omit<Expense, 'id' | 'userId'>>
  ): Promise<Expense> {
    const parse = expenseUpdateSchema.safeParse(expenseInput);
    if (!parse.success) {
      throw new ValidationError(parse.error.errors[0].message);
    }

    // Validate category exists and is accessible if changing
    if (expenseInput.categoryId) {
      const category = await this.categoryRepo.findById(userId, expenseInput.categoryId);
      if (!category) {
        throw new NotFoundError('Category not found or inaccessible');
      }
    }

    return this.expenseRepo.updateExpense(userId, id, expenseInput);
  }

  async deleteExpense(userId: string, id: string): Promise<void> {
    return this.expenseRepo.deleteExpense(userId, id);
  }

  async getExpense(userId: string, id: string): Promise<Expense> {
    const expense = await this.expenseRepo.getExpense(userId, id);
    if (!expense) {
      throw new NotFoundError('Expense record not found');
    }
    return expense;
  }
}
