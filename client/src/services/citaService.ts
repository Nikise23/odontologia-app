import { Cita, EstadisticasCitas, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Obtener todas las citas con filtros
export const getCitas = async (filtros?: {
  fecha?: string;
  estado?: string;
  pacienteId?: string;
  limite?: number;
}): Promise<ApiResponse<Cita[]>> => {
  const params = new URLSearchParams();
  if (filtros?.fecha) params.append('fecha', filtros.fecha);
  if (filtros?.estado) params.append('estado', filtros.estado);
  if (filtros?.pacienteId) params.append('pacienteId', filtros.pacienteId);
  if (filtros?.limite) params.append('limite', filtros.limite.toString());

  const response = await fetch(`${API_BASE_URL}/citas?${params}`);
  return response.json();
};

// Obtener citas de un día específico
export const getCitasDelDia = async (fecha: string): Promise<ApiResponse<Cita[]>> => {
  const response = await fetch(`${API_BASE_URL}/citas/dia/${fecha}`);
  return response.json();
};

// Obtener próximas citas
export const getProximasCitas = async (limite?: number): Promise<ApiResponse<Cita[]>> => {
  const params = limite ? `?limite=${limite}` : '';
  const response = await fetch(`${API_BASE_URL}/citas/proximas${params}`);
  return response.json();
};

// Obtener una cita específica
export const getCita = async (id: string): Promise<ApiResponse<Cita>> => {
  const response = await fetch(`${API_BASE_URL}/citas/${id}`);
  return response.json();
};

// Crear nueva cita
export const createCita = async (citaData: {
  pacienteId: string;
  fecha: string;
  hora: string;
  motivo?: string;
  observaciones?: string;
  duracionEstimada?: number;
  tipoCita?: 'consulta' | 'tratamiento' | 'revision' | 'urgencia' | 'limpieza';
  costoEstimado?: number;
}): Promise<ApiResponse<Cita>> => {
  // Combinar fecha y hora correctamente
  const fechaBase = new Date(citaData.fecha);
  const [hora, minutos] = citaData.hora.split(':');
  fechaBase.setHours(parseInt(hora), parseInt(minutos), 0, 0);
  
  console.log('📅 Fecha original:', citaData.fecha);
  console.log('🕐 Hora:', citaData.hora);
  console.log('📅 Fecha combinada:', fechaBase.toISOString());
  
  const dataToSend = {
    pacienteId: citaData.pacienteId,
    fecha: fechaBase.toISOString(),
    hora: citaData.hora,
    motivo: citaData.motivo || '',
    observaciones: citaData.observaciones || '',
    duracionEstimada: citaData.duracionEstimada || 30,
    tipoCita: citaData.tipoCita || 'consulta',
    costoEstimado: Number(citaData.costoEstimado) || 0
  };

  const response = await fetch(`${API_BASE_URL}/citas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataToSend),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear la cita');
  }
  
  return response.json();
};

// Actualizar cita
export const updateCita = async (id: string, citaData: Partial<Cita>): Promise<ApiResponse<Cita>> => {
  const response = await fetch(`${API_BASE_URL}/citas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(citaData),
  });
  return response.json();
};

// Eliminar cita
export const deleteCita = async (id: string): Promise<ApiResponse<void>> => {
  const response = await fetch(`${API_BASE_URL}/citas/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

// Marcar cita como atendida
export const marcarCitaComoAtendida = async (id: string, consultaId?: string): Promise<ApiResponse<Cita>> => {
  const response = await fetch(`${API_BASE_URL}/citas/${id}/atender`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ consultaId }),
  });
  return response.json();
};

// Marcar cita como ausente
export const marcarCitaComoAusente = async (id: string): Promise<ApiResponse<Cita>> => {
  const response = await fetch(`${API_BASE_URL}/citas/${id}/ausente`, {
    method: 'PUT',
  });
  return response.json();
};

// Obtener estadísticas de citas
export const getEstadisticasCitas = async (fechaInicio?: string, fechaFin?: string): Promise<ApiResponse<EstadisticasCitas>> => {
  const params = new URLSearchParams();
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);

  const response = await fetch(`${API_BASE_URL}/citas/estadisticas/resumen?${params}`);
  return response.json();
};
