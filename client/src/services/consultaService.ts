import { Consulta, ResumenConsultas, ApiResponse } from '../types';

// En producción, si no hay REACT_APP_API_URL, usar la misma URL (backend y frontend juntos)
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL 
  : process.env.NODE_ENV === 'production'
    ? '/api'  // Mismo origen cuando están juntos
    : 'http://localhost:5000/api';

// Obtener todas las consultas de un paciente
export const getConsultas = async (pacienteId: string): Promise<ApiResponse<Consulta[]>> => {
  const response = await fetch(`${API_BASE_URL}/consultas/${pacienteId}`);
  return response.json();
};

// Obtener el próximo número de consulta
export const getProximoNumeroConsulta = async (pacienteId: string): Promise<ApiResponse<{ proximoNumero: number }>> => {
  const response = await fetch(`${API_BASE_URL}/consultas/${pacienteId}/ultima`);
  return response.json();
};

// Crear nueva consulta
export const createConsulta = async (consultaData: {
  pacienteId: string;
  motivoConsulta?: string;
  diagnostico?: string;
  tratamientosRealizados: Array<{
    piezaDental: string;
    tratamiento: string;
    costo: number;
    observaciones?: string;
  }>;
  observacionesGenerales?: string;
  cambiosOdontograma?: string;
  costoConsulta: number;
  anamnesis?: {
    sintomas?: string;
    alergias?: string;
    medicamentos?: string;
    antecedentesClinicos?: string;
    examenFisico?: string;
    planTratamiento?: string;
  };
}): Promise<ApiResponse<Consulta>> => {
  console.log('📋 Datos enviados para crear consulta:', consultaData);
  
  const response = await fetch(`${API_BASE_URL}/consultas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(consultaData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ Error del servidor:', errorData);
    throw new Error(errorData.message || 'Error al crear consulta');
  }
  
  return response.json();
};

// Actualizar consulta
export const updateConsulta = async (consultaId: string, consultaData: Partial<Consulta>): Promise<ApiResponse<Consulta>> => {
  const response = await fetch(`${API_BASE_URL}/consultas/${consultaId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(consultaData),
  });
  return response.json();
};

// Eliminar consulta
export const deleteConsulta = async (consultaId: string): Promise<ApiResponse<void>> => {
  const response = await fetch(`${API_BASE_URL}/consultas/${consultaId}`, {
    method: 'DELETE',
  });
  return response.json();
};

// Obtener resumen de consultas
export const getResumenConsultas = async (pacienteId: string): Promise<ApiResponse<ResumenConsultas>> => {
  const response = await fetch(`${API_BASE_URL}/consultas/${pacienteId}/resumen`);
  return response.json();
};

// Guardar odontograma en consulta
export const guardarOdontogramaConsulta = async (consultaId: string, odontogramaData: {
  odontogramaSnapshot: any;
  cambiosOdontograma?: string;
}): Promise<ApiResponse<Consulta>> => {
  const response = await fetch(`${API_BASE_URL}/consultas/${consultaId}/guardar-odontograma`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(odontogramaData),
  });
  return response.json();
};

// Obtener odontograma de consulta
export const getOdontogramaConsulta = async (consultaId: string): Promise<ApiResponse<{
  odontogramaSnapshot: any;
  cambiosOdontograma?: string;
  fecha: Date;
}>> => {
  const response = await fetch(`${API_BASE_URL}/consultas/${consultaId}/odontograma`);
  return response.json();
};
