import React from 'react';
import { StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import ExpenseChartWithFilter from '../components/ExpenseChart/ExpenseChartWithFilter';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const StatisticsScreen: React.FC = () => {
  return (
    <Layout style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text category="h6" style={styles.title}>
          Estadísticas
        </Text>

        <ExpenseChartWithFilter />
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
  title: {
    marginBottom: vh * 2,
    color: '#003366',
    fontWeight: '700',
    paddingHorizontal: screenWidth * 0.05,
  },
});

export default StatisticsScreen;
