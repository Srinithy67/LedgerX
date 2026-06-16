import { Response, NextFunction } from 'express';
import { ExpenseService } from '../../core/usecases/ExpenseService';
import { AuthenticatedRequest } from '../../frameworks/web/middlewares/authMiddleware';

export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { categoryId, startDate, endDate } = req.query;

      const filters = {
        categoryId: categoryId ? String(categoryId) : undefined,
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
      };

      const expenses = await this.expenseService.listExpenses(userId, filters);
      res.status(200).json({
        success: true,
        data: expenses,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { amount, description, categoryId, paymentMethod, date } = req.body;

      const expense = await this.expenseService.createExpense(userId, {
        amount,
        description,
        categoryId: categoryId || null,
        paymentMethod,
        date: new Date(date),
      });

      res.status(201).json({
        success: true,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { amount, description, categoryId, paymentMethod, date } = req.body;

      const expense = await this.expenseService.updateExpense(userId, id, {
        amount,
        description,
        categoryId: categoryId || undefined,
        paymentMethod,
        date: date ? new Date(date) : undefined,
      });

      res.status(200).json({
        success: true,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await this.expenseService.deleteExpense(userId, id);
      res.status(200).json({
        success: true,
        message: 'Expense deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  get = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const expense = await this.expenseService.getExpense(userId, id);
      res.status(200).json({
        success: true,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };
}
