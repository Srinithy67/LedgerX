import { SupabaseProfileRepository } from '../adapters/repositories/SupabaseProfileRepository';
import { SupabaseCategoryRepository } from '../adapters/repositories/SupabaseCategoryRepository';
import { SupabaseExpenseRepository } from '../adapters/repositories/SupabaseExpenseRepository';
import { MemoryProfileRepository } from '../adapters/repositories/MemoryProfileRepository';
import { MemoryCategoryRepository } from '../adapters/repositories/MemoryCategoryRepository';
import { MemoryExpenseRepository } from '../adapters/repositories/MemoryExpenseRepository';
import { TesseractOcrService } from '../adapters/services/OcrService';

import { AuthService } from '../core/usecases/AuthService';
import { CategoryService } from '../core/usecases/CategoryService';
import { ExpenseService } from '../core/usecases/ExpenseService';
import { OcrUseCase } from '../core/usecases/OcrUseCase';
import { AnalyticsService } from '../core/usecases/AnalyticsService';

import { AuthController } from '../adapters/controllers/AuthController';
import { CategoryController } from '../adapters/controllers/CategoryController';
import { ExpenseController } from '../adapters/controllers/ExpenseController';
import { OcrController } from '../adapters/controllers/OcrController';
import { AnalyticsController } from '../adapters/controllers/AnalyticsController';

const useMemoryStore = process.env.USE_MEMORY_STORE === 'true';

// Instantiate Repositories
export const profileRepository = useMemoryStore
  ? new MemoryProfileRepository()
  : new SupabaseProfileRepository();
export const categoryRepository = useMemoryStore
  ? new MemoryCategoryRepository()
  : new SupabaseCategoryRepository();
export const expenseRepository = useMemoryStore
  ? new MemoryExpenseRepository()
  : new SupabaseExpenseRepository();

// Instantiate Third-party Services
export const ocrService = new TesseractOcrService();

// Instantiate Use Cases / Business Logic Services
export const authService = new AuthService(profileRepository);
export const categoryService = new CategoryService(categoryRepository);
export const expenseService = new ExpenseService(expenseRepository, categoryRepository);
export const ocrUseCase = new OcrUseCase(ocrService, categoryRepository);
export const analyticsService = new AnalyticsService(expenseRepository);

// Instantiate Controllers
export const authController = new AuthController(authService);
export const categoryController = new CategoryController(categoryService);
export const expenseController = new ExpenseController(expenseService);
export const ocrController = new OcrController(ocrUseCase);
export const analyticsController = new AnalyticsController(analyticsService);
