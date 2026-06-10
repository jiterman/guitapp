import { useContext } from 'react';
import { RulesContext } from './context';

export const useRules = () => {
  const context = useContext(RulesContext);
  if (context === undefined) {
    throw new Error('useRules debe ser utilizado dentro de un RulesProvider');
  }
  return context;
};
