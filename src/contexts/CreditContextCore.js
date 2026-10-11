import { createContext, useContext } from 'react';

const CreditContext = createContext(null);

export function useCredit() {
    const value = useContext(CreditContext);
    if (!value) throw new Error('useCredit must be used inside CreditProvider');
    return value;
}

export default CreditContext;
