import { createContext, useContext } from 'react';

const VocabularyExplainContext = createContext(null);

export function useVocabularyExplain() {
    const value = useContext(VocabularyExplainContext);
    if (!value) {
        throw new Error(
            'useVocabularyExplain must be used inside VocabularyExplainProvider'
        );
    }
    return value;
}

export default VocabularyExplainContext;

