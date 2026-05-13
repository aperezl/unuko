import { calculateProgress } from '@unuko/core';
export const getVisualProgress = (state) => {
    // XState nos da los 'tags' y el valor jerárquico
    return {
        current: state.value, // Ej: { provisioning: 'downloading' }
        percentage: calculateProgress(state.value), // Lógica basada en nodos totales
        history: state.historyValue,
        canResume: state.can('RESUME_WORKFLOW'),
        lastUpdate: new Date().toISOString()
    };
};
