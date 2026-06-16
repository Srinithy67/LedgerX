export type CategoryGroup = 'essential' | 'leisure' | 'savings';

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  isCustom: boolean;
  categoryGroup: CategoryGroup;
  createdAt?: Date;
}
