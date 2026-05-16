import React from 'react';
import { StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Layout } from '@ui-kitten/components';
import ExpenseChartWithFilter from '../components/ExpenseChart/ExpenseChartWithFilter';

const { height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const StatisticsScreen: React.FC = () => {
  return (
    <Layout style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
});

export default StatisticsScreen;
