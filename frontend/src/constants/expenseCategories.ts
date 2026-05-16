import { ExpenseCategory } from '../services/expenseService';

export interface CategoryConfig {
  color: string;
  emoji: string;
}

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  SUPERMARKET: '#FF6384',
  RESTAURANT: '#E85D75',
  CAFE: '#FFCD56',
  DELIVERY: '#FF9F40',
  PUBLIC_TRANSPORT: '#4BC0C0',
  FUEL: '#36A2EB',
  TAXI: '#5ACCCC',
  UTILITIES: '#FFE066',
  RENT: '#FFAD3D',
  HOME: '#FFDB5C',
  DOCTOR: '#4DD4A4',
  PHARMACY: '#5FD99F',
  SUBSCRIPTIONS: '#9966FF',
  OUTINGS: '#FF99CC',
  BAR: '#FF8833',
  GYM: '#54B8F5',
  TRAVEL: '#B088FF',
  CLOTHING: '#FF7399',
  EDUCATION: '#3DBFAF',
  TECHNOLOGY: '#4AB2EB',
  HOA_FEES: '#FFD142',
  VEHICLE: '#8899AA',
  BEAUTY: '#FFB3D9',
  PETS: '#AA88DD',
  OTHER: '#A8B8C8',
};
