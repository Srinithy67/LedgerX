export interface Expense {
  id: string;
  userId: string;
  amount: number;
  description: string;
  categoryId: string | null;
  paymentMethod: string;
  date: Date;
  createdAt?: Date;
  category?: {
    name: string;
    categoryGroup: 'essential' | 'leisure' | 'savings';
  };
}
