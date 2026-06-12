import { createContext } from 'react';
import { CategoryRuleResponse } from '../../services/ruleService';

interface RulesContextType {
  rules: CategoryRuleResponse[];
  setRules: (rules: CategoryRuleResponse[]) => void;
  addRule: (newRule: CategoryRuleResponse) => void;
  updateRuleInState: (id: number, updatedType: 'FIXED' | 'VARIABLE') => void;
  removeRuleFromState: (id: number) => void;
}

export const RulesContext = createContext<RulesContextType | undefined>(undefined);
