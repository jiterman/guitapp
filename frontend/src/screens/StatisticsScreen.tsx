import React from 'react';
import { StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Layout } from '@ui-kitten/components';
import { useLocalSearchParams } from 'expo-router';
import ExpenseChartWithFilter, {
  ChartType,
} from '../components/ExpenseChart/ExpenseChartWithFilter';

const { height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const StatisticsScreen: React.FC = () => {
  const { chart } = useLocalSearchParams<{ chart?: string }>();
  const initialChart: ChartType | undefined =
    chart === 'categories' || chart === 'fixed-variable' ? chart : undefined;

  return (
    <Layout style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ExpenseChartWithFilter initialChart={initialChart} />
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F2FC',
    paddingTop: vh * 3,
    paddingHorizontal: 0,
  },
});

export default StatisticsScreen;
