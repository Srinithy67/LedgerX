import { Response, NextFunction } from 'express';
import { CategoryService } from '../../core/usecases/CategoryService';
import { AuthenticatedRequest } from '../../frameworks/web/middlewares/authMiddleware';

export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const categories = await this.categoryService.listCategories(userId);
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { name, categoryGroup } = req.body;
      const category = await this.categoryService.createCategory(userId, name, categoryGroup);
      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { name, categoryGroup } = req.body;
      const category = await this.categoryService.updateCategory(userId, id, name, categoryGroup);
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await this.categoryService.deleteCategory(userId, id);
      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
