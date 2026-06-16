import { IExpenseRepository } from './repositories/IExpenseRepository';
import { Expense } from '../entities/Expense';

export interface CategorySpend {
  categoryName: string;
  categoryGroup: string;
  amount: number;
  percentage: number;
}

export interface GardenPlotSpend {
  group: 'essential' | 'leisure' | 'savings';
  amount: number;
  percentage: number;
}

export interface MonthlySpend {
  month: string; // "YYYY-MM"
  amount: number;
}

export interface DailySpend {
  day: string; // "Mon", "Tue", etc.
  date: string; // "YYYY-MM-DD"
  amount: number;
}

export interface AnalyticsPayload {
  totalSpending: number;
  monthlySpending: MonthlySpend[];
  categorySpending: CategorySpend[];
  gardenPlotBreakdown: GardenPlotSpend[];
  mostUsedCategory: {
    name: string;
    count: number;
    amount: number;
  } | null;
  spendingTrends: {
    daily: DailySpend[];
    monthly: MonthlySpend[];
  };
}

export class AnalyticsService {
  constructor(private expenseRepo: IExpenseRepository) {}

  async getAnalytics(userId: string): Promise<AnalyticsPayload> {
    const expenses = await this.expenseRepo.listExpenses(userId);

    const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // 1. Group by Month
    const monthlyMap = new Map<string, number>();
    // 2. Group by Category
    const categoryMap = new Map<string, { group: string; amount: number; count: number }>();
    // 3. Group by Garden Plot (Category Group)
    const groupMap = new Map<'essential' | 'leisure' | 'savings', number>([
      ['essential', 0],
      ['leisure', 0],
      ['savings', 0],
    ]);

    expenses.forEach((exp) => {
      // Month grouping
      const dateObj = new Date(exp.date);
      const monthStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(monthStr, (monthlyMap.get(monthStr) || 0) + exp.amount);

      // Category grouping
      const catName = exp.category?.name || 'Uncategorized';
      const catGroup = exp.category?.categoryGroup || 'leisure';
      const catStats = categoryMap.get(catName) || { group: catGroup, amount: 0, count: 0 };
      catStats.amount += exp.amount;
      catStats.count += 1;
      categoryMap.set(catName, catStats);

      // Category group grouping
      const grp = (exp.category?.categoryGroup || 'leisure') as 'essential' | 'leisure' | 'savings';
      groupMap.set(grp, (groupMap.get(grp) || 0) + exp.amount);
    });

    // Format Monthly Spending
    const monthlySpending: MonthlySpend[] = Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Format Category Spending
    const categorySpending: CategorySpend[] = Array.from(categoryMap.entries()).map(
      ([categoryName, stats]) => ({
        categoryName,
        categoryGroup: stats.group,
        amount: parseFloat(stats.amount.toFixed(2)),
        percentage: totalSpending > 0 ? parseFloat(((stats.amount / totalSpending) * 100).toFixed(1)) : 0,
      })
    ).sort((a, b) => b.amount - a.amount);

    // Format Garden Plot Breakdown
    const gardenPlotBreakdown: GardenPlotSpend[] = Array.from(groupMap.entries()).map(
      ([group, amount]) => ({
        group,
        amount: parseFloat(amount.toFixed(2)),
        percentage: totalSpending > 0 ? parseFloat(((amount / totalSpending) * 100).toFixed(1)) : 0,
      })
    );

    // Find Most Used Category (by transaction count)
    let mostUsedCategory = null;
    let maxCount = 0;
    categoryMap.forEach((stats, name) => {
      if (stats.count > maxCount) {
        maxCount = stats.count;
        mostUsedCategory = {
          name,
          count: stats.count,
          amount: parseFloat(stats.amount.toFixed(2)),
        };
      }
    });

    // 4. Daily spending for the last 7 days (including days with $0 spending)
    const daily: DailySpend[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];

      // Find sum of expenses on this specific date (UTC date boundary)
      const dayAmount = expenses
        .filter((exp) => new Date(exp.date).toISOString().split('T')[0] === dateStr)
        .reduce((sum, exp) => sum + exp.amount, 0);

      daily.push({
        day: dayName,
        date: dateStr,
        amount: parseFloat(dayAmount.toFixed(2)),
      });
    }

    return {
      totalSpending: parseFloat(totalSpending.toFixed(2)),
      monthlySpending,
      categorySpending,
      gardenPlotBreakdown,
      mostUsedCategory,
      spendingTrends: {
        daily,
        monthly: monthlySpending,
      },
    };
  }
}
