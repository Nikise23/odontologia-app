import axios from 'axios';
import { Paciente, PaginatedResponse, ApiResponse, Odontograma, Pago, Tratamiento } from '../types';

// En producción, si no hay REACT_APP_API_URL, usar la misma URL (backend y frontend juntos)
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL 
  : process.env.NODE_ENV === 'production'
    ? '/api'  // Mismo origen cuando están juntos
    : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Servicios de Pacientes
export const getPacientes = async (
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<PaginatedResponse<Paciente>> => {
  const response = await api.get('/pacientes', {
    params: { page, limit, search }
  });
  return response.data;
};

export const searchPacientes = async (searchTerm: string): Promise<ApiResponse<Paciente[]>> => {
  const response = await api.get('/pacientes', {
    params: { search: searchTerm, limit: 20, page: 1 }
  });
  return response.data;
};

export const getPaciente = async (id: string): Promise<ApiResponse<Paciente>> => {
  const response = await api.get(`/pacientes/${id}`);
  return response.data;
};

export const getOdontograma = async (pacienteId: string): Promise<ApiResponse<Odontograma>> => {
  const response = await api.get(`/odontograma/${pacienteId}`);
  return response.data;
};

export const createPaciente = async (paciente: Partial<Paciente>): Promise<ApiResponse<Paciente>> => {
  const response = await api.post('/pacientes', paciente);
  return response.data;
};

export const updatePaciente = async (id: string, paciente: Partial<Paciente>): Promise<ApiResponse<Paciente>> => {
  const response = await api.put(`/pacientes/${id}`, paciente);
  return response.data;
};

export const deletePaciente = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/pacientes/${id}`);
  return response.data;
};

// Servicios de Odontograma

export const saveOdontograma = async (odontogramaData: any): Promise<ApiResponse<Odontograma>> => {
  const response = await api.post('/odontograma', odontogramaData);
  return response.data;
};

export const updatePiezaDental = async (odontogramaId: string, piezaData: any): Promise<ApiResponse<Odontograma>> => {
  const response = await api.put(`/odontograma/${odontogramaId}`, piezaData);
  return response.data;
};

export const getHistorialOdontograma = async (
  pacienteId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<any>> => {
  const response = await api.get(`/odontograma/${pacienteId}/historial`, {
    params: { page, limit }
  });
  return response.data;
};

// Servicios de Pagos
export const getPagos = async (
  pacienteId: string,
  page: number = 1,
  limit: number = 10,
  estado?: string
): Promise<PaginatedResponse<Pago>> => {
  const response = await api.get(`/pagos/${pacienteId}`, {
    params: { page, limit, estado }
  });
  return response.data;
};

export const createPago = async (pagoData: Partial<Pago>): Promise<ApiResponse<Pago>> => {
  const response = await api.post('/pagos', pagoData);
  return response.data;
};

export const updatePago = async (id: string, pagoData: Partial<Pago>): Promise<ApiResponse<Pago>> => {
  const response = await api.put(`/pagos/${id}`, pagoData);
  return response.data;
};

export const addPagoParcial = async (id: string, pagoParcialData: any): Promise<ApiResponse<Pago>> => {
  const response = await api.post(`/pagos/${id}/pago-parcial`, pagoParcialData);
  return response.data;
};

export const getResumenPagos = async (pacienteId: string): Promise<ApiResponse<any>> => {
  const response = await api.get(`/pagos/${pacienteId}/resumen`);
  return response.data;
};

export const deletePago = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/pagos/${id}`);
  return response.data;
};

// Servicios de Tratamientos
export const getTratamientos = async (
  page: number = 1,
  limit: number = 10,
  pacienteId?: string,
  piezaDental?: string,
  estado?: string,
  categoria?: string
): Promise<PaginatedResponse<Tratamiento>> => {
  const response = await api.get('/tratamientos', {
    params: { page, limit, pacienteId, piezaDental, estado, categoria }
  });
  return response.data;
};

export const getTratamiento = async (id: string): Promise<ApiResponse<Tratamiento>> => {
  const response = await api.get(`/tratamientos/${id}`);
  return response.data;
};

export const createTratamiento = async (tratamientoData: Partial<Tratamiento>): Promise<ApiResponse<Tratamiento>> => {
  const response = await api.post('/tratamientos', tratamientoData);
  return response.data;
};

export const updateTratamiento = async (id: string, tratamientoData: Partial<Tratamiento>): Promise<ApiResponse<Tratamiento>> => {
  const response = await api.put(`/tratamientos/${id}`, tratamientoData);
  return response.data;
};

export const deleteTratamiento = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/tratamientos/${id}`);
  return response.data;
};

export const getTratamientosPaciente = async (
  pacienteId: string,
  categoria?: string,
  estado?: string
): Promise<ApiResponse<Tratamiento[]>> => {
  const response = await api.get(`/tratamientos/paciente/${pacienteId}`, {
    params: { categoria, estado }
  });
  return response.data;
};
