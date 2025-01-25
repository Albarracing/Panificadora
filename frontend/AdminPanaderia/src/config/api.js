// Obtener la URL base del backend desde la variable de entorno
export const BASE_URL =
  import.meta.env.REACT_APP_BACKEND_URL || "https://panificadora.onrender.com";

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

// Exportación por defecto de API_PREFIX para mantener compatibilidad con los imports existentes
export default API_PREFIX;
