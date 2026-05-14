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
  { label: 'Supermercado', value: 'SUPERMARKET', icon: '🛒' },
  { label: 'Restaurante', value: 'RESTAURANT', icon: '🍽️' },
  { label: 'Café', value: 'CAFE', icon: '☕' },
  { label: 'Delivery', value: 'DELIVERY', icon: '🛵' },
  { label: 'Transporte público', value: 'PUBLIC_TRANSPORT', icon: '🚌' },
  { label: 'Combustible', value: 'FUEL', icon: '⛽' },
  { label: 'Taxi/Uber', value: 'TAXI', icon: '🚕' },
  { label: 'Servicios', value: 'UTILITIES', icon: '💡' },
  { label: 'Alquiler', value: 'RENT', icon: '🏠' },
  { label: 'Mantenimiento del hogar', value: 'HOME', icon: '🔧' },
  { label: 'Expensas', value: 'HOA_FEES', icon: '🏢' },
  { label: 'Vehículo', value: 'VEHICLE', icon: '🚗' },
  { label: 'Médico', value: 'DOCTOR', icon: '🏥' },
  { label: 'Farmacia', value: 'PHARMACY', icon: '💊' },
  { label: 'Suscripciones', value: 'SUBSCRIPTIONS', icon: '📱' },
  { label: 'Salidas', value: 'OUTINGS', icon: '🎉' },
  { label: 'Bar', value: 'BAR', icon: '🍺' },
  { label: 'Gym', value: 'GYM', icon: '🏋️' },
  { label: 'Viajes', value: 'TRAVEL', icon: '✈️' },
  { label: 'Ropa', value: 'CLOTHING', icon: '👕' },
  { label: 'Educación', value: 'EDUCATION', icon: '📚' },
  { label: 'Tecnología', value: 'TECHNOLOGY', icon: '💻' },
  { label: 'Belleza', value: 'BEAUTY', icon: '💅' },
  { label: 'Mascotas', value: 'PETS', icon: '🐾' },
  { label: 'Otros', value: 'OTHER', icon: '📦' },
];

export const INCOME_CATEGORIES: IncomeCategoryOption[] = [
  { label: 'Sueldo', value: 'SALARY', icon: '💼' },
  { label: 'Freelance', value: 'FREELANCE', icon: '🧑‍💻' },
  { label: 'Regalo', value: 'GIFT', icon: '🎁' },
  { label: 'Inversión', value: 'INVESTMENT', icon: '📈' },
  { label: 'Otros', value: 'OTHER', icon: '📦' },
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
