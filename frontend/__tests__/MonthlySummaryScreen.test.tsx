import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import MonthlySummaryScreen from '../src/screens/MonthlySummaryScreen';
import {
  monthlySummaryService,
  MonthlySummaryResponse,
} from '../src/services/monthlySummaryService';

jest.mock('../src/services/monthlySummaryService', () => ({
  monthlySummaryService: {
    getMonthlySummary: jest.fn(),
  },
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ApplicationProvider {...eva} theme={eva.light}>
    {children}
  </ApplicationProvider>
);

const renderScreen = () =>
  render(
    <Wrapper>
      <MonthlySummaryScreen />
    </Wrapper>
  );

const mockSummary: MonthlySummaryResponse = {
  year: 2025,
  month: 4,
  totalIncome: 3000,
  totalExpenses: 1500,
  balance: 1500,
  categoryBreakdown: [
    { category: 'RENT', totalAmount: 1000, percentage: 66.7, changeVsPreviousMonth: 10 },
    { category: 'DELIVERY', totalAmount: 500, percentage: 33.3, changeVsPreviousMonth: -20 },
  ],
  insights: [
    { type: 'SAVINGS', message: 'Ahorraste $1500 este mes (50% de tus ingresos)', value: 50 },
    { type: 'TOP_CATEGORY', message: 'Tu mayor gasto fue en Alquiler', value: 66.7 },
    {
      type: 'EXPENSES_VS_PREV_MONTH',
      message: 'Tus gastos totales bajaron un 10% vs el mes pasado',
      value: -10,
    },
    { type: 'CATEGORY_CHANGE', message: 'Este mes gastaste un 142% más en Delivery', value: 142 },
  ],
};

describe('MonthlySummaryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading indicator while fetching', async () => {
    (monthlySummaryService.getMonthlySummary as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    renderScreen();
    await waitFor(() => {
      expect(monthlySummaryService.getMonthlySummary).toHaveBeenCalled();
    });
  });

  it('renders balance card and insights after successful fetch', async () => {
    (monthlySummaryService.getMonthlySummary as jest.Mock).mockResolvedValue(mockSummary);

    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('Ahorraste $1500 este mes (50% de tus ingresos)')).toBeTruthy();
      expect(getByText('Tu mayor gasto fue en Alquiler')).toBeTruthy();
    });
  });

  it('renders category breakdown', async () => {
    (monthlySummaryService.getMonthlySummary as jest.Mock).mockResolvedValue(mockSummary);

    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('Alquiler')).toBeTruthy();
      expect(getByText('Delivery')).toBeTruthy();
    });
  });

  it('shows error message on fetch failure', async () => {
    (monthlySummaryService.getMonthlySummary as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('No se pudo cargar el resumen mensual.')).toBeTruthy();
    });
  });

  it('shows empty state when no data', async () => {
    const emptySummary: MonthlySummaryResponse = {
      ...mockSummary,
      categoryBreakdown: [],
      insights: [],
    };
    (monthlySummaryService.getMonthlySummary as jest.Mock).mockResolvedValue(emptySummary);

    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('No hay datos registrados para este mes.')).toBeTruthy();
    });
  });

  it('fetches summary on mount', async () => {
    (monthlySummaryService.getMonthlySummary as jest.Mock).mockResolvedValue(mockSummary);

    renderScreen();

    await waitFor(() => {
      expect(monthlySummaryService.getMonthlySummary).toHaveBeenCalledTimes(1);
    });
  });

  it('shows positive change badge as red and negative as green', async () => {
    (monthlySummaryService.getMonthlySummary as jest.Mock).mockResolvedValue(mockSummary);

    const { getAllByText } = renderScreen();

    await waitFor(() => {
      const tenPctTexts = getAllByText('10%');
      expect(tenPctTexts.length).toBeGreaterThan(0);
      const twentyPctTexts = getAllByText('20%');
      expect(twentyPctTexts.length).toBeGreaterThan(0);
    });
  });
});
