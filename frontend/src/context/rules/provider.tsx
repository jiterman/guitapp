import React, { useState } from 'react';
import { CategoryRuleResponse } from '../../services/ruleService';
import { RulesContext } from './context';

interface RulesProviderProps {
  children: React.ReactNode;
}

export const RulesProvider: React.FC<RulesProviderProps> = ({ children }) => {
  const [rules, setRules] = useState<CategoryRuleResponse[]>([]);

  const addRule = (newRule: CategoryRuleResponse) => {
    setRules(prevRules => [newRule, ...prevRules]);
  };

  const updateRuleInState = (id: number, updatedType: 'FIXED' | 'VARIABLE') => {
    setRules(prevRules =>
      prevRules.map(rule => (rule.id === id ? { ...rule, expenseType: updatedType } : rule))
    );
  };

  const removeRuleFromState = (id: number) => {
    setRules(prevRules => prevRules.filter(rule => rule.id !== id));
  };

  return (
    <RulesContext.Provider
      value={{
        rules,
        setRules,
        addRule,
        updateRuleInState,
        removeRuleFromState,
      }}
    >
      {children}
    </RulesContext.Provider>
  );
};
