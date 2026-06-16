import { ICategoryRepository } from './repositories/ICategoryRepository';
import { Category, CategoryGroup } from '../entities/Category';
import { ValidationError } from '../errors/AppError';
import { categoryCreateSchema, categoryUpdateSchema } from '../validation/schemas';

export class CategoryService {
  constructor(private categoryRepo: ICategoryRepository) {}

  async listCategories(userId: string): Promise<Category[]> {
    return this.categoryRepo.listCategories(userId);
  }

  async createCategory(userId: string, name: string, categoryGroup: CategoryGroup): Promise<Category> {
    const parse = categoryCreateSchema.safeParse({ name, categoryGroup });
    if (!parse.success) {
      throw new ValidationError(parse.error.errors[0].message);
    }

    return this.categoryRepo.createCategory(userId, name.trim(), categoryGroup);
  }

  async updateCategory(
    userId: string,
    id: string,
    name?: string,
    categoryGroup?: CategoryGroup
  ): Promise<Category> {
    const parse = categoryUpdateSchema.safeParse({ name, categoryGroup });
    if (!parse.success) {
      throw new ValidationError(parse.error.errors[0].message);
    }

    const trimmedName = name !== undefined ? name.trim() : undefined;
    return this.categoryRepo.updateCategory(userId, id, trimmedName, categoryGroup);
  }

  async deleteCategory(userId: string, id: string): Promise<void> {
    return this.categoryRepo.deleteCategory(userId, id);
  }
}
