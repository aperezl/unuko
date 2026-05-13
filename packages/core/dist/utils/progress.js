export function calculateProgress(value) {
    // Aquí mapeamos los estados clave a un porcentaje de 0 a 100
    const weights = {
        'idle': 0,
        'authenticating': 20,
        'downloading': 50,
        'installing': 80,
        'SUCCESS': 100
    };
    // Lógica para extraer el peso del estado actual
    return weights[typeof value === 'string' ? value : Object.keys(value)[0]] || 0;
}
