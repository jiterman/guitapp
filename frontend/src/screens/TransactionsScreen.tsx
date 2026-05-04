import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
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
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const renderItem = ({ item }: { item: MovementResponse }) => <TransactionCard movement={item} />;

  return (
    <Layout style={{ flex: 1, padding: 16 }}>
      <Text category="h6" style={{ marginBottom: 8 }}>
        Lista de Transacciones
      </Text>
      <FlatList
        data={movements}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#EEF6FB' }} />}
      />
    </Layout>
  );
};

// styles not needed (TransactionCard provides styling)

export default TransactionsScreen;
