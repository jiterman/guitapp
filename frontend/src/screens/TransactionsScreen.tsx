import React from 'react';
import { Text } from 'react-native';
import { Layout } from '@ui-kitten/components';

const TransactionsScreen: React.FC = () => {
  return (
    <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Transacciones (vacío)</Text>
    </Layout>
  );
};

export default TransactionsScreen;
