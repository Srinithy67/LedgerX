import { Category, CategoryGroup } from '../../entities/Category';

export interface ICategoryRepository {
  listCategories(userId: string): Promise<Category[]>;
  createCategory(userId: string, name: string, categoryGroup: CategoryGroup): Promise<Category>;
  updateCategory(userId: string, id: string, name?: string, categoryGroup?: CategoryGroup): Promise<Category>;
  deleteCategory(userId: string, id: string): Promise<void>;
  findByName(userId: string, name: string): Promise<Category | null>;
  findById(userId: string, id: string): Promise<Category | null>;
}
