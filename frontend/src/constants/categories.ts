export type ExpenseType = 'FIXED' | 'VARIABLE';

export interface ExpenseCategoryOption {
  label: string;
  value: string;
  icon: string;
  defaultType: ExpenseType;
}

export interface IncomeCategoryOption {
  label: string;
  value: string;
  icon: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategoryOption[] = [
  { label: 'Supermercado', value: 'SUPERMARKET', icon: 'cart-outline', defaultType: 'VARIABLE' },
  {
    label: 'Restaurante',
    value: 'RESTAURANT',
    icon: 'restaurant-outline',
    defaultType: 'VARIABLE',
  },
  { label: 'Café', value: 'CAFE', icon: 'cafe-outline', defaultType: 'VARIABLE' },
  { label: 'Delivery', value: 'DELIVERY', icon: 'fast-food-outline', defaultType: 'VARIABLE' },
  {
    label: 'Transporte público',
    value: 'PUBLIC_TRANSPORT',
    icon: 'bus-outline',
    defaultType: 'VARIABLE',
  },
  { label: 'Combustible', value: 'FUEL', icon: 'water-outline', defaultType: 'VARIABLE' },
  { label: 'Taxi/Uber', value: 'TAXI', icon: 'car-outline', defaultType: 'VARIABLE' },
  { label: 'Servicios', value: 'UTILITIES', icon: 'flash-outline', defaultType: 'FIXED' },
  { label: 'Alquiler', value: 'RENT', icon: 'home-outline', defaultType: 'FIXED' },
  {
    label: 'Mantenimiento del hogar',
    value: 'HOME',
    icon: 'hammer-outline',
    defaultType: 'VARIABLE',
  },
  { label: 'Expensas', value: 'HOA_FEES', icon: 'business-outline', defaultType: 'FIXED' },
  { label: 'Vehículo', value: 'VEHICLE', icon: 'car-sport-outline', defaultType: 'VARIABLE' },
  { label: 'Médico', value: 'DOCTOR', icon: 'medkit-outline', defaultType: 'VARIABLE' },
  { label: 'Farmacia', value: 'PHARMACY', icon: 'bandage-outline', defaultType: 'VARIABLE' },
  {
    label: 'Suscripciones',
    value: 'SUBSCRIPTIONS',
    icon: 'logo-youtube',
    defaultType: 'FIXED',
  },
  { label: 'Salidas', value: 'OUTINGS', icon: 'wine-outline', defaultType: 'VARIABLE' },
  { label: 'Gym', value: 'GYM', icon: 'barbell-outline', defaultType: 'FIXED' },
  { label: 'Viajes', value: 'TRAVEL', icon: 'airplane-outline', defaultType: 'VARIABLE' },
  { label: 'Ropa', value: 'CLOTHING', icon: 'shirt-outline', defaultType: 'VARIABLE' },
  { label: 'Educación', value: 'EDUCATION', icon: 'school-outline', defaultType: 'FIXED' },
  { label: 'Tecnología', value: 'TECHNOLOGY', icon: 'laptop-outline', defaultType: 'VARIABLE' },
  { label: 'Belleza', value: 'BEAUTY', icon: 'cut-outline', defaultType: 'VARIABLE' },
  { label: 'Mascotas', value: 'PETS', icon: 'paw-outline', defaultType: 'VARIABLE' },
  { label: 'Compras', value: 'SHOPPING', icon: 'bag-handle-outline', defaultType: 'VARIABLE' },
  { label: 'Otros', value: 'OTHER', icon: 'infinite-outline', defaultType: 'VARIABLE' },
];

export const INCOME_CATEGORIES: IncomeCategoryOption[] = [
  { label: 'Sueldo', value: 'SALARY', icon: 'briefcase-outline' },
  { label: 'Freelance', value: 'FREELANCE', icon: 'code-slash-outline' },
  { label: 'Regalo', value: 'GIFT', icon: 'gift-outline' },
  { label: 'Inversión', value: 'INVESTMENT', icon: 'trending-up-outline' },
  { label: 'Otros', value: 'OTHER', icon: 'cube-outline' },
];

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]['value'];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number]['value'];

export const getCategoryLabel = (category: string, type: 'INCOME' | 'EXPENSE'): string => {
  if (type === 'INCOME') {
    const found = INCOME_CATEGORIES.find(c => c.value === category);
    return found?.label ?? category;
  }
  const found = EXPENSE_CATEGORIES.find(c => c.value === category);
  return found?.label ?? category;
};

export const getCategoryOption = (
  category: string,
  type: 'INCOME' | 'EXPENSE'
): ExpenseCategoryOption | IncomeCategoryOption | null => {
  if (type === 'INCOME') {
    return INCOME_CATEGORIES.find(c => c.value === category) ?? null;
  }
  return EXPENSE_CATEGORIES.find(c => c.value === category) ?? null;
};

export const getCategoryIcon = (category: string): string => {
  const expenseOption = EXPENSE_CATEGORIES.find(c => c.value === category);
  if (expenseOption) return expenseOption.icon;
  const incomeOption = INCOME_CATEGORIES.find(c => c.value === category);
  if (incomeOption) return incomeOption.icon;
  return 'cube-outline';
};
