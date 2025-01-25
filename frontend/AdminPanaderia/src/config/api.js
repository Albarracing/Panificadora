// Obtener la URL base del backend desde la variable de entorno
export const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

// Prefijos comunes
export const API_PREFIX = `${BASE_URL}/api`;

// Rutas base principales
export const ROUTES = {
    ARTICULOS: `${API_PREFIX}/articulos`,
    CLIENTES: `${API_PREFIX}/clientes`,
    REPARTOS: `${API_PREFIX}/repartos`,
    LOCALIDADES: `${API_PREFIX}/localidades`,
    REPARTIDORES: `${API_PREFIX}/repartidores`,
    CUENTA_CORRIENTE: `${API_PREFIX}/cuenta-corriente`,
};
