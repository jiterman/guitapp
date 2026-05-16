import { ExpenseCategory } from '../services/expenseService';
import { IncomeCategory } from '../services/incomeService';

export interface ExpenseCategoryOption {
  label: string;
  value: ExpenseCategory;
  icon: string;
}

export interface IncomeCategoryOption {
  label: string;
  value: IncomeCategory;
  icon: string;
}

export const CATEGORIES: ExpenseCategoryOption[] = [
  { label: 'Supermercado', value: 'SUPERMARKET', icon: 'cart-outline' },
  { label: 'Restaurante', value: 'RESTAURANT', icon: 'restaurant-outline' },
  { label: 'Café', value: 'CAFE', icon: 'cafe-outline' },
  { label: 'Delivery', value: 'DELIVERY', icon: 'bicycle-outline' },
  { label: 'Transporte público', value: 'PUBLIC_TRANSPORT', icon: 'bus-outline' },
  { label: 'Combustible', value: 'FUEL', icon: 'water-outline' },
  { label: 'Taxi/Uber', value: 'TAXI', icon: 'car-outline' },
  { label: 'Servicios', value: 'UTILITIES', icon: 'flash-outline' },
  { label: 'Alquiler', value: 'RENT', icon: 'home-outline' },
  { label: 'Mantenimiento del hogar', value: 'HOME', icon: 'hammer-outline' },
  { label: 'Expensas', value: 'HOA_FEES', icon: 'business-outline' },
  { label: 'Vehículo', value: 'VEHICLE', icon: 'car-sport-outline' },
  { label: 'Médico', value: 'DOCTOR', icon: 'medical-outline' },
  { label: 'Farmacia', value: 'PHARMACY', icon: 'medical-outline' },
  { label: 'Suscripciones', value: 'SUBSCRIPTIONS', icon: 'phone-portrait-outline' },
  { label: 'Salidas', value: 'OUTINGS', icon: 'happy-outline' },
  { label: 'Bar', value: 'BAR', icon: 'beer-outline' },
  { label: 'Gym', value: 'GYM', icon: 'barbell-outline' },
  { label: 'Viajes', value: 'TRAVEL', icon: 'airplane-outline' },
  { label: 'Ropa', value: 'CLOTHING', icon: 'shirt-outline' },
  { label: 'Educación', value: 'EDUCATION', icon: 'school-outline' },
  { label: 'Tecnología', value: 'TECHNOLOGY', icon: 'laptop-outline' },
  { label: 'Belleza', value: 'BEAUTY', icon: 'cut-outline' },
  { label: 'Mascotas', value: 'PETS', icon: 'paw-outline' },
  { label: 'Otros', value: 'OTHER', icon: 'cube-outline' },
];

export const INCOME_CATEGORIES: IncomeCategoryOption[] = [
  { label: 'Sueldo', value: 'SALARY', icon: 'briefcase-outline' },
  { label: 'Freelance', value: 'FREELANCE', icon: 'code-slash-outline' },
  { label: 'Regalo', value: 'GIFT', icon: 'gift-outline' },
  { label: 'Inversión', value: 'INVESTMENT', icon: 'trending-up-outline' },
  { label: 'Otros', value: 'OTHER', icon: 'cube-outline' },
];

export const getCategoryLabel = (category: string, type: 'INCOME' | 'EXPENSE'): string => {
  if (type === 'INCOME') {
    const found = INCOME_CATEGORIES.find(c => c.value === category);
    return found?.label ?? category;
  }
  const found = CATEGORIES.find(c => c.value === category);
  return found?.label ?? category;
};

export const getCategoryOption = (
  category: string,
  type: 'INCOME' | 'EXPENSE'
): ExpenseCategoryOption | IncomeCategoryOption | null => {
  if (type === 'INCOME') {
    return INCOME_CATEGORIES.find(c => c.value === category) ?? null;
  }
  return CATEGORIES.find(c => c.value === category) ?? null;
};

export const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    // Expense categories
    SUPERMARKET: 'cart-outline',
    RESTAURANT: 'restaurant-outline',
    CAFE: 'cafe-outline',
    DELIVERY: 'bicycle-outline',
    PUBLIC_TRANSPORT: 'bus-outline',
    FUEL: 'water-outline',
    TAXI: 'car-outline',
    UTILITIES: 'flash-outline',
    RENT: 'home-outline',
    HOME: 'hammer-outline',
    HOA_FEES: 'business-outline',
    VEHICLE: 'car-sport-outline',
    DOCTOR: 'medical-outline',
    PHARMACY: 'medical-outline',
    SUBSCRIPTIONS: 'phone-portrait-outline',
    OUTINGS: 'happy-outline',
    BAR: 'beer-outline',
    GYM: 'barbell-outline',
    TRAVEL: 'airplane-outline',
    CLOTHING: 'shirt-outline',
    EDUCATION: 'school-outline',
    TECHNOLOGY: 'laptop-outline',
    BEAUTY: 'cut-outline',
    PETS: 'paw-outline',
    // Income categories
    SALARY: 'briefcase-outline',
    FREELANCE: 'code-slash-outline',
    GIFT: 'gift-outline',
    INVESTMENT: 'trending-up-outline',
    // Default
    OTHER: 'cube-outline',
  };
  return iconMap[category] ?? 'cube-outline';
};
