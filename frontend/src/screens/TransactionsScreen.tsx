import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { movementService, MovementResponse } from '../services/movementService';
import TransactionCard from '../components/TransactionCard/TransactionCard';

const TransactionsScreen: React.FC = () => {
  const [movements, setMovements] = useState<MovementResponse[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await movementService.getMovements();
        if (mounted) setMovements(data.slice(0, 100));
      } catch (err) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const renderItem = ({ item }: { item: MovementResponse }) => (
    <TransactionCard movement={item} />
  );

  return (
    <Layout style={{ flex: 1, padding: 16 }}>
      <Text category="h6" style={{ marginBottom: 8 }}>Lista de Transacciones</Text>
      <FlatList
        data={movements}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#EEF6FB' }} />}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  incomeBg: { backgroundColor: 'rgba(26,158,92,0.08)' },
  expenseBg: { backgroundColor: 'rgba(192,57,43,0.08)' },
  incomeAmount: { color: '#1a9e5c', fontWeight: '700' },
  expenseAmount: { color: '#c0392b', fontWeight: '700' },
});

export default TransactionsScreen;
