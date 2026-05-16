import { ExpenseCategory } from '../services/expenseService';

export interface CategoryConfig {
  color: string;
  emoji: string;
}

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  SUPERMARKET: '#FF6B9D',
  RESTAURANT: '#C44569',
  CAFE: '#FFA07A',
  DELIVERY: '#FF7F50',
  PUBLIC_TRANSPORT: '#4ECDC4',
  FUEL: '#45B7D1',
  TAXI: '#5F9EA0',
  UTILITIES: '#FFD93D',
  RENT: '#F8B500',
  HOME: '#FCB900',
  DOCTOR: '#6BCF7F',
  PHARMACY: '#51CF66',
  SUBSCRIPTIONS: '#A29BFE',
  OUTINGS: '#FD79A8',
  BAR: '#E17055',
  GYM: '#74B9FF',
  TRAVEL: '#A29BFE',
  CLOTHING: '#FF7675',
  EDUCATION: '#00B894',
  TECHNOLOGY: '#0984E3',
  HOA_FEES: '#FDCB6E',
  VEHICLE: '#636E72',
  BEAUTY: '#FD79A8',
  PETS: '#A29BFE',
  OTHER: '#B2BEC3',
};
