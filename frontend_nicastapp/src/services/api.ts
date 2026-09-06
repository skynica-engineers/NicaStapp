import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, DeviceEventEmitter } from 'react-native';
import { router } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
  const url = `${API_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  try {
    const token = await AsyncStorage.getItem('@token');
    if (token) {
      options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
    }
  } catch (e) {
    // Ignore async storage error
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  // Prevent login endpoint from triggering the generic session expired error
  if (response.status === 401 && !endpoint.includes('/auth/login')) {
    DeviceEventEmitter.emit('onTokenExpired');
    // Return a promise that never resolves. Since we are navigating to /login immediately,
    // this prevents the caller from throwing and logging an error that would show a RedBox.
    return new Promise(() => {});
  }

  if (!response.ok) {
    throw new Error(data.error || 'Error en la petición');
  }
  return data;
};

export const getDeportes = async () => {
  try {
    return await apiCall(`/deportes`);
  } catch (error) {
    console.error('getDeportes API Error:', error);
    return [];
  }
};

export const getHomeFeed = async () => {
  try {
    return await apiCall(`/feed/home`);
  } catch (error) {
    console.error('getHomeFeed API Error:', error);
    return [];
  }
};

export const getTorneos = async () => {
  try {
    return await apiCall(`/torneos`);
  } catch (error) {
    console.error('getTorneos API Error:', error);
    return [];
  }
};

export const getTorneoTablas = async (torneoId: string) => {
  try {
    return await apiCall(`/torneos/${torneoId}/tablas`);
  } catch (error) {
    console.error('getTorneoTablas API Error:', error);
    return null;
  }
};

// --- Catálogos (Geografía) ---
export const getDepartamentos = async () => {
  try {
    return await apiCall(`/catalog/departamentos`);
  } catch (error) {
    console.error('getDepartamentos API Error:', error);
    return [];
  }
};

export const getMunicipios = async (departamentoId: number) => {
  try {
    return await apiCall(`/catalog/municipios/${departamentoId}`);
  } catch (error) {
    console.error('getMunicipios API Error:', error);
    return [];
  }
};

// --- Organizaciones ---
export const createOrganizacion = async (data: any) => {
  return await apiCall('/organizaciones', 'POST', data);
};

export const updateOrganizacion = async (id: string, data: any) => {
  return await apiCall(`/organizaciones/${id}`, 'PUT', data);
};

export const getMyOrganizaciones = async (userId: string) => {
  try {
    return await apiCall(`/organizaciones/usuario/${userId}`);
  } catch (error) {
    console.error('getMyOrganizaciones API Error:', error);
    return [];
  }
};

export const getOrganizacionById = async (id: string) => {
  try {
    return await apiCall(`/organizaciones/${id}`);
  } catch (error) {
    console.error('getOrganizacionById API Error:', error);
    return null;
  }
};

export const createTorneo = async (data: any) => {
  return await apiCall('/torneos', 'POST', data);
};

export const getAcreditacionesMesa = async (organizacionId: string) => {
  try {
    return await apiCall(`/organizaciones/${organizacionId}/acreditaciones`);
  } catch (error) {
    console.error('getAcreditacionesMesa API Error:', error);
    return [];
  }
};

export const updateEstadoAcreditacion = async (acreditacionId: string, estado: string) => {
  return await apiCall(`/organizaciones/acreditaciones/${acreditacionId}/estado`, 'PUT', { estado_aprobacion: estado });
};

export const getTorneoById = async (id: string) => {
  try {
    return await apiCall(`/torneos/${id}`);
  } catch (error) {
    console.error('getTorneoById API Error:', error);
    return null;
  }
};

export const getSolicitudesAcreditacionTorneo = async (torneoId: string, rol?: string, estado?: string) => {
  try {
    const params = new URLSearchParams();
    if (rol) params.append('rol', rol);
    if (estado) params.append('estado', estado);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiCall(`/torneos/${torneoId}/solicitudes${query}`);
  } catch (error) {
    console.error('getSolicitudesAcreditacionTorneo API Error:', error);
    return [];
  }
};

export const updateEstadoAcreditacionTorneo = async (torneoId: string, acreditacionId: string, estado: string) => {
  return await apiCall(`/torneos/${torneoId}/acreditaciones/${acreditacionId}/estado`, 'PUT', { estado_aprobacion: estado });
};

export const getEquiposTorneo = async (torneoId: string, estado?: string) => {
  try {
    const query = estado ? `?estado=${estado}` : '';
    return await apiCall(`/torneos/${torneoId}/equipos${query}`);
  } catch (error) {
    console.error('getEquiposTorneo API Error:', error);
    return [];
  }
};

export const updateEstadoInscripcionEquipo = async (torneoId: string, inscripcionId: string, estado: string) => {
  return await apiCall(`/torneos/${torneoId}/inscripciones/${inscripcionId}/estado`, 'PUT', { estado_inscripcion: estado });
};

// ==========================================
// Comunicados (REQ-ORG-05)
// ==========================================

export const getComunicados = async (orgId: string, torneoId?: string) => {
  const query = torneoId ? `?torneoId=${torneoId}` : '';
  return await apiCall(`/organizaciones/${orgId}/comunicados${query}`);
};

export const createComunicado = async (orgId: string, data: { titulo: string, contenido: string, tipo_aviso: string, torneo_id?: string }) => {
  return await apiCall(`/organizaciones/${orgId}/comunicados`, 'POST', data);
};

// ==========================================
// Jornadas / Encuentros (REQ-ORG-05)
// ==========================================

export const getEncuentrosGlobales = async () => {
  return await apiCall('/encuentros/all');
};

export const getMisParticipaciones = async (perfilId: string) => {
  return await apiCall(`/torneos/participacion/${perfilId}`);
};

// --- Perfil ---
export const getPerfil = async (id: string) => {
  return await apiCall(`/perfiles/${id}`);
};

export const getEncuentrosTorneo = async (torneoId: string) => {
  return await apiCall(`/encuentros/torneo/${torneoId}`);
};

export const programarEncuentro = async (data: {
  torneo_id: string;
  anotador_id: string;
  fecha_hora: string;
  sede_instalacion: string;
  competidores: { equipo_id?: string; atleta_id?: string; rol_posicion_etiqueta: string }[];
}) => {
  return await apiCall('/encuentros', 'POST', data);
};

// ==========================================
// Organizaciones Global & Acreditaciones
// ==========================================

export const getAllOrganizaciones = async () => {
  return await apiCall('/organizaciones');
};

export const solicitarAcreditacionTecnica = async (organizacionId: string, data: { perfil_id: string, deporte_id: number, rol_acreditacion: string }) => {
  return await apiCall(`/organizaciones/${organizacionId}/acreditaciones`, 'POST', data);
};

export const asignarPersonalTorneo = async (torneoId: string, data: { perfil_id: string, organizacion_id: string, deporte_id: number, rol_acreditacion: string }) => {
  return await apiCall(`/torneos/${torneoId}/acreditaciones`, 'POST', data);
};

export const updateEstadoTorneo = async (torneoId: string, estado: string) => {
  return await apiCall(`/torneos/${torneoId}/estado`, 'PUT', { estado });
};

export const getComunidades = async (municipioId: string | number) => {
  return await apiCall(`/catalog/comunidades/municipio/${municipioId}`);
};

// ==========================================
// Equipos
// ==========================================

export const getAllEquipos = async () => {
  return await apiCall('/equipos/all');
};

export const createEquipo = async (data: { nombre: string; deporte_id: number; municipio_id: number; administrador_id: string }) => {
  return await apiCall('/equipos', 'POST', data);
};

export const getEquiposByUsuario = async (userId: string) => {
  return await apiCall(`/equipos/usuario/${userId}`);
};

export const getEquipoById = async (id: string) => {
  return await apiCall(`/equipos/${id}`);
};

// ==========================================
// Plantilla / Roster
// ==========================================

export const getEquipoRoster = async (equipoId: string) => {
  return await apiCall(`/equipos/${equipoId}/atletas`);
};

export const addAtletaToRoster = async (equipoId: string, data: { nombre_completo: string; identificacion?: string; perfil_id?: string }) => {
  return await apiCall(`/equipos/${equipoId}/atletas`, 'POST', data);
};

export const removeAtletaFromRoster = async (equipoId: string, atletaId: string) => {
  return await apiCall(`/equipos/${equipoId}/atletas/${atletaId}`, 'DELETE');
};

export const searchPerfiles = async (query: string) => {
  return await apiCall(`/perfiles/search?q=${encodeURIComponent(query)}`);
};

// ==========================================
// Torneos - Inscripciones (Equipos)
// ==========================================

export const getTorneosDisponibles = async (equipoId: string) => {
  return await apiCall(`/equipos/${equipoId}/torneos-disponibles`);
};

export const solicitarInscripcionTorneo = async (torneoId: string, equipoId: string) => {
  return await apiCall(`/torneos/${torneoId}/inscripciones`, 'POST', { equipo_id: equipoId });
};

export const getTorneosInscritos = async (equipoId: string) => {
  return await apiCall(`/equipos/${equipoId}/torneos-inscritos`);
};

// ==========================================
// Atletas (Ficha Digital)
// ==========================================

export const getAtletaFicha = async (atletaId: string) => {
  return await apiCall(`/atletas/${atletaId}/ficha`);
};

export const reclamarFicha = async (atletaId: string, perfilId: string) => {
  return await apiCall(`/atletas/${atletaId}/reclamar`, 'POST', { perfil_id: perfilId });
};

export const getSolicitudesVinculacion = async (equipoId: string) => {
  return await apiCall(`/equipos/${equipoId}/solicitudes-vinculacion`);
};

export const resolverSolicitudVinculacion = async (equipoId: string, solicitudId: string, estado: 'aprobada' | 'rechazada') => {
  return await apiCall(`/equipos/${equipoId}/solicitudes-vinculacion/${solicitudId}/estado`, 'PUT', { estado });
};
