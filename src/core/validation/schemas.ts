import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const expenseCreateSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  description: z.string().default(''),
  categoryId: z.string().uuid('Invalid category ID').nullable().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  date: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date({ invalid_type_error: 'Invalid date format' })),
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name is too long'),
  categoryGroup: z.enum(['essential', 'leisure', 'savings'], {
    errorMap: () => ({ message: 'Category group must be essential, leisure, or savings' }),
  }),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const themeUpdateSchema = z.object({
  theme: z.enum(['Matcha Strawberry', 'Ocean Milk', 'Pastel Purple'], {
    errorMap: () => ({ message: 'Theme must be Matcha Strawberry, Ocean Milk, or Pastel Purple' }),
  }),
});
