import { AnalyticsService } from '../core/usecases/AnalyticsService';
import { IExpenseRepository } from '../core/usecases/repositories/IExpenseRepository';
import { Expense } from '../core/entities/Expense';

describe('AnalyticsService Tests', () => {
  let mockExpenseRepo: jest.Mocked<IExpenseRepository>;
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    mockExpenseRepo = {
      listExpenses: jest.fn(),
      createExpense: jest.fn(),
      updateExpense: jest.fn(),
      deleteExpense: jest.fn(),
      getExpense: jest.fn(),
    } as any;

    analyticsService = new AnalyticsService(mockExpenseRepo);
  });

  test('should aggregate expenses into garden plot groups and monthly spending correctly', async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const mockExpenses: Expense[] = [
      {
        id: '1',
        userId: 'user-123',
        amount: 100.0,
        description: 'Grocery Shopping',
        categoryId: 'cat-essential',
        paymentMethod: 'Debit Card',
        date: new Date(todayStr),
        category: { name: 'Groceries', categoryGroup: 'essential' },
      },
      {
        id: '2',
        userId: 'user-123',
        amount: 50.0,
        description: 'New Shirt',
        categoryId: 'cat-leisure',
        paymentMethod: 'Cash',
        date: new Date(todayStr),
        category: { name: 'Shopping', categoryGroup: 'leisure' },
      },
      {
        id: '3',
        userId: 'user-123',
        amount: 200.0,
        description: 'Retirement Savings Transfer',
        categoryId: 'cat-savings',
        paymentMethod: 'Bank Transfer',
        date: new Date(yesterdayStr),
        category: { name: 'Retirement', categoryGroup: 'savings' },
      },
    ];

    mockExpenseRepo.listExpenses.mockResolvedValue(mockExpenses);

    const result = await analyticsService.getAnalytics('user-123');

    // Verify Total Sum
    expect(result.totalSpending).toBe(350.0);

    // Verify Garden Plot Group Breakdown
    const essential = result.gardenPlotBreakdown.find((g) => g.group === 'essential');
    const leisure = result.gardenPlotBreakdown.find((g) => g.group === 'leisure');
    const savings = result.gardenPlotBreakdown.find((g) => g.group === 'savings');

    expect(essential?.amount).toBe(100.0);
    expect(essential?.percentage).toBe(28.6); // 100 / 350 * 100

    expect(leisure?.amount).toBe(50.0);
    expect(leisure?.percentage).toBe(14.3); // 50 / 350 * 100

    expect(savings?.amount).toBe(200.0);
    expect(savings?.percentage).toBe(57.1); // 200 / 350 * 100

    // Verify Spending trends daily totals
    const todayTrend = result.spendingTrends.daily.find((d) => d.date === todayStr);
    const yesterdayTrend = result.spendingTrends.daily.find((d) => d.date === yesterdayStr);

    expect(todayTrend?.amount).toBe(150.0); // 100 + 50
    expect(yesterdayTrend?.amount).toBe(200.0);
  });
});
