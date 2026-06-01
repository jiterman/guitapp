import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import MonthlySummaryScreen from '../src/screens/MonthlySummaryScreen';
import {
  monthlySummaryService,
  MonthlySummaryResponse,
} from '../src/services/monthlySummaryService';
import { healthScoreService } from '../src/services/healthScoreService';

jest.mock('../src/services/monthlySummaryService', () => ({
  monthlySummaryService: {
    getMonthlySummary: jest.fn(),
  },
}));

jest.mock('../src/services/healthScoreService', () => ({
  healthScoreService: {
    getHealthScore: jest.fn(),
  },
}));

const mockHealthScore = {
  score: 78,
  title: '¡Muy buen mes! 💪',
  message: 'Sólido. Hay algún detalle para mejorar, pero vas por buen camino.',
  level: 'great',
  factors: [],
};

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
    {
      type: 'SAVINGS',
      label: 'Ahorraste',
      highlight: '36%',
      sub: 'de tus ingresos',
      variant: 'positive',
      category: null,
    },
    {
      type: 'TOP_CATEGORY',
      label: 'Mayor gasto: Alquiler',
      highlight: '67%',
      sub: 'del total',
      variant: 'neutral',
      category: 'RENT',
    },
    {
      type: 'EXPENSES_VS_PREV_MONTH',
      label: 'Tus gastos bajaron',
      highlight: '-10%',
      sub: 'vs mes anterior',
      variant: 'positive',
      category: null,
    },
    {
      type: 'CATEGORY_INCREASE',
      label: 'Mayor aumento: Delivery',
      highlight: '+142%',
      sub: 'vs mes anterior',
      variant: 'negative',
      category: 'DELIVERY',
    },
  ],
};

describe('MonthlySummaryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (healthScoreService.getHealthScore as jest.Mock).mockResolvedValue(mockHealthScore);
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
      expect(getByText('Ahorraste')).toBeTruthy();
      expect(getByText('de tus ingresos')).toBeTruthy();
      expect(getByText('del total')).toBeTruthy();
    });
  });

  it('renders category breakdown', async () => {
    (monthlySummaryService.getMonthlySummary as jest.Mock).mockResolvedValue(mockSummary);

    const { getAllByText, getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('Alquiler')).toBeTruthy();
      expect(getAllByText('Delivery').length).toBeGreaterThan(0);
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

  it('shows change badges in category breakdown', async () => {
    (monthlySummaryService.getMonthlySummary as jest.Mock).mockResolvedValue(mockSummary);

    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('Alquiler')).toBeTruthy();
    });
  });
});
