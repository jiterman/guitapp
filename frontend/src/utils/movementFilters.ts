import { MovementResponse } from '../services/movementService';
import { FilterState } from '../components/MovementFilter/MovementFilter';
import { getCategoryLabel } from '../constants/categories';

const stripAccents = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '');

// Applies the advanced filters (movement type, categories, expense type and
// accent-insensitive search) client-side. Period filtering is handled by the
// caller via the movement service endpoints.
export const applyClientFilters = (data: MovementResponse[], filter: FilterState) => {
  const { movementType, categories, expenseType, search } = filter;
  const normalizedSearch = stripAccents(search?.trim().toLowerCase() ?? '');

  return data.filter(movement => {
    if (movementType === 'income' && movement.type !== 'INCOME') return false;
    if (movementType === 'expense' && movement.type !== 'EXPENSE') return false;
    const hasCategoryFilter = !!categories && categories.length > 0;
    if (hasCategoryFilter && !(movement.category && categories.includes(movement.category))) {
      return false;
    }
    if (expenseType && expenseType !== 'all' && movement.expenseType !== expenseType) return false;
    if (normalizedSearch) {
      // Match the same text the card shows: the title, or the category label
      // when there is no title.
      const categoryLabel = movement.category
        ? getCategoryLabel(movement.category, movement.type)
        : '';
      const haystack = stripAccents(`${movement.title ?? ''} ${categoryLabel}`.toLowerCase());
      if (!haystack.includes(normalizedSearch)) return false;
    }
    return true;
  });
};
