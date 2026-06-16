import { randomUUID } from 'crypto';
import { Expense } from '../../core/entities/Expense';
import { IExpenseRepository } from '../../core/usecases/repositories/IExpenseRepository';
import { NotFoundError } from '../../core/errors/AppError';
import { MemoryCategoryRepository } from './MemoryCategoryRepository';

const expenses = new Map<string, Expense>();
const categoryRepo = new MemoryCategoryRepository();

export class MemoryExpenseRepository implements IExpenseRepository {
  async listExpenses(userId: string): Promise<Expense[]> {
    const userExpenses = Array.from(expenses.values())
      .filter((e) => e.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return Promise.all(userExpenses.map((e) => this.attachCategory(userId, e)));
  }

  async getExpense(userId: string, id: string): Promise<Expense | null> {
    const expense = expenses.get(id);
    if (!expense || expense.userId !== userId) return null;
    return this.attachCategory(userId, expense);
  }

  async createExpense(userId: string, expenseInput: Omit<Expense, 'id' | 'userId'>): Promise<Expense> {
    const expense: Expense = {
      id: randomUUID(),
      userId,
      amount: expenseInput.amount,
      description: expenseInput.description,
      categoryId: expenseInput.categoryId,
      paymentMethod: expenseInput.paymentMethod,
      date: expenseInput.date,
      createdAt: new Date(),
    };
    expenses.set(expense.id, expense);
    return this.attachCategory(userId, expense);
  }

  async updateExpense(
    userId: string,
    id: string,
    updates: Partial<Pick<Expense, 'amount' | 'description' | 'categoryId' | 'paymentMethod' | 'date'>>
  ): Promise<Expense> {
    const existing = expenses.get(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError('Expense not found');
    }

    const updated: Expense = {
      ...existing,
      amount: updates.amount ?? existing.amount,
      description: updates.description ?? existing.description,
      categoryId: updates.categoryId !== undefined ? updates.categoryId : existing.categoryId,
      paymentMethod: updates.paymentMethod ?? existing.paymentMethod,
      date: updates.date ?? existing.date,
    };
    expenses.set(id, updated);
    return this.attachCategory(userId, updated);
  }

  async deleteExpense(userId: string, id: string): Promise<void> {
    const existing = expenses.get(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError('Expense not found');
    }
    expenses.delete(id);
  }

  private async attachCategory(userId: string, expense: Expense): Promise<Expense> {
    if (!expense.categoryId) return expense;
    const category = await categoryRepo.findById(userId, expense.categoryId);
    if (!category) return expense;
    return {
      ...expense,
      category: {
        name: category.name,
        categoryGroup: category.categoryGroup,
      },
    };
  }
}
