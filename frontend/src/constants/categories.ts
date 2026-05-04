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
