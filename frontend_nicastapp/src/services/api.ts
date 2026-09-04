import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { router } from 'expo-router';

const LOCAL_IP = '192.168.123.33';
const API_URL = `http://${LOCAL_IP}:3000/api`;

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

  if (response.status === 401) {
    await AsyncStorage.removeItem('@token');
    await AsyncStorage.removeItem('@user');
    router.replace('/login');
    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  }

  if (!response.ok) {
    throw new Error(data.error || 'Error en la petición');
  }
  return data;
};

export const getDeportes = async () => {
  try {
    const response = await fetch(`${API_URL}/deportes`);
    if (!response.ok) throw new Error('Error al obtener deportes');
    return await response.json();
  } catch (error) {
    console.error('getDeportes API Error:', error);
    return [];
  }
};

export const getHomeFeed = async () => {
  try {
    const response = await fetch(`${API_URL}/feed/home`);
    if (!response.ok) throw new Error('Error al obtener el feed principal');
    return await response.json();
  } catch (error) {
    console.error('getHomeFeed API Error:', error);
    return [];
  }
};

export const getTorneos = async () => {
  try {
    const response = await fetch(`${API_URL}/torneos`);
    if (!response.ok) throw new Error('Error al obtener torneos');
    return await response.json();
  } catch (error) {
    console.error('getTorneos API Error:', error);
    return [];
  }
};

export const getTorneoTablas = async (torneoId: string) => {
  try {
    const response = await fetch(`${API_URL}/torneos/${torneoId}/tablas`);
    if (!response.ok) throw new Error('Error al obtener tablas');
    return await response.json();
  } catch (error) {
    console.error('getTorneoTablas API Error:', error);
    return null;
  }
};

// --- Catálogos (Geografía) ---
export const getDepartamentos = async () => {
  try {
    const response = await fetch(`${API_URL}/catalog/departamentos`);
    if (!response.ok) throw new Error('Error al obtener departamentos');
    return await response.json();
  } catch (error) {
    console.error('getDepartamentos API Error:', error);
    return [];
  }
};

export const getMunicipios = async (departamentoId: number) => {
  try {
    const response = await fetch(`${API_URL}/catalog/municipios/${departamentoId}`);
    if (!response.ok) throw new Error('Error al obtener municipios');
    return await response.json();
  } catch (error) {
    console.error('getMunicipios API Error:', error);
    return [];
  }
};

// --- Organizaciones ---
export const createOrganizacion = async (data: any) => {
  return await apiCall('/organizaciones', 'POST', data);
};

export const getMyOrganizaciones = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/organizaciones/usuario/${userId}`);
    if (!response.ok) throw new Error('Error al obtener mis organizaciones');
    return await response.json();
  } catch (error) {
    console.error('getMyOrganizaciones API Error:', error);
    return [];
  }
};

export const getOrganizacionById = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/organizaciones/${id}`);
    if (!response.ok) throw new Error('Error al obtener organización');
    return await response.json();
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
    const response = await fetch(`${API_URL}/organizaciones/${organizacionId}/acreditaciones`);
    if (!response.ok) throw new Error('Error al obtener acreditaciones');
    return await response.json();
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
    const response = await fetch(`${API_URL}/torneos/${id}`);
    if (!response.ok) throw new Error('Error al obtener torneo');
    return await response.json();
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
    const response = await fetch(`${API_URL}/torneos/${torneoId}/solicitudes${query}`);
    if (!response.ok) throw new Error('Error al obtener solicitudes');
    return await response.json();
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
    const response = await fetch(`${API_URL}/torneos/${torneoId}/equipos${query}`);
    if (!response.ok) throw new Error('Error al obtener equipos');
    return await response.json();
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
  const response = await fetch(`${API_URL}/organizaciones/${orgId}/comunicados${query}`);
  if (!response.ok) {
    throw new Error('Error al obtener comunicados');
  }
  return response.json();
};

export const createComunicado = async (orgId: string, data: { titulo: string, contenido: string, tipo_aviso: string, torneo_id?: string }) => {
  const response = await fetch(`${API_URL}/organizaciones/${orgId}/comunicados`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al crear comunicado');
  }
  return response.json();
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
