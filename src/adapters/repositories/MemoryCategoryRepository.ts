import { randomUUID } from 'crypto';
import { Category, CategoryGroup } from '../../core/entities/Category';
import { ICategoryRepository } from '../../core/usecases/repositories/ICategoryRepository';
import { AppError, NotFoundError } from '../../core/errors/AppError';

const SYSTEM_CATEGORIES: Array<{ name: string; categoryGroup: CategoryGroup }> = [
  { name: 'Food', categoryGroup: 'essential' },
  { name: 'Groceries', categoryGroup: 'essential' },
  { name: 'Dining Out', categoryGroup: 'leisure' },
  { name: 'Shopping', categoryGroup: 'leisure' },
  { name: 'Health', categoryGroup: 'essential' },
  { name: 'Wellness', categoryGroup: 'essential' },
  { name: 'Bills', categoryGroup: 'essential' },
  { name: 'Transport', categoryGroup: 'essential' },
  { name: 'Entertainment', categoryGroup: 'leisure' },
  { name: 'Creativity', categoryGroup: 'leisure' },
];

const categories = new Map<string, Category>();

function seedCategories() {
  if (categories.size > 0) return;
  for (const cat of SYSTEM_CATEGORIES) {
    const id = randomUUID();
    categories.set(id, {
      id,
      userId: null,
      name: cat.name,
      isCustom: false,
      categoryGroup: cat.categoryGroup,
      createdAt: new Date(),
    });
  }
}

export class MemoryCategoryRepository implements ICategoryRepository {
  constructor() {
    seedCategories();
  }

  async listCategories(userId: string): Promise<Category[]> {
    return Array.from(categories.values())
      .filter((c) => c.userId === null || c.userId === userId)
      .sort((a, b) => {
        if (a.isCustom !== b.isCustom) return a.isCustom ? 1 : -1;
        return a.name.localeCompare(b.name);
      });
  }

  async createCategory(userId: string, name: string, categoryGroup: CategoryGroup): Promise<Category> {
    const duplicate = Array.from(categories.values()).find(
      (c) => c.name.toLowerCase() === name.toLowerCase() && (c.userId === null || c.userId === userId)
    );
    if (duplicate) {
      throw new AppError(`Category with name "${name}" already exists`, 400);
    }

    const category: Category = {
      id: randomUUID(),
      userId,
      name,
      isCustom: true,
      categoryGroup,
      createdAt: new Date(),
    };
    categories.set(category.id, category);
    return category;
  }

  async updateCategory(
    userId: string,
    id: string,
    name?: string,
    categoryGroup?: CategoryGroup
  ): Promise<Category> {
    const existing = await this.findById(userId, id);
    if (!existing) {
      throw new NotFoundError('Category not found or you do not have permission to edit it');
    }
    if (!existing.isCustom) {
      throw new AppError('Cannot update system-defined categories', 400);
    }

    const updated: Category = {
      ...existing,
      name: name ?? existing.name,
      categoryGroup: categoryGroup ?? existing.categoryGroup,
    };
    categories.set(id, updated);
    return updated;
  }

  async deleteCategory(userId: string, id: string): Promise<void> {
    const existing = await this.findById(userId, id);
    if (!existing) {
      throw new NotFoundError('Category not found or you do not have permission to delete it');
    }
    if (!existing.isCustom) {
      throw new AppError('Cannot delete system-defined categories', 400);
    }
    categories.delete(id);
  }

  async findByName(userId: string, name: string): Promise<Category | null> {
    return (
      Array.from(categories.values()).find(
        (c) => c.name.toLowerCase() === name.toLowerCase() && (c.userId === null || c.userId === userId)
      ) ?? null
    );
  }

  async findById(userId: string, id: string): Promise<Category | null> {
    const category = categories.get(id);
    if (!category) return null;
    if (category.userId !== null && category.userId !== userId) return null;
    return category;
  }
}
