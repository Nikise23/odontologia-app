import axios from './axiosConfig';
import { Tratamiento } from '../types';

export const getTratamientos = async (pacienteId: string): Promise<Tratamiento[]> => {
  const response = await axios.get(`/tratamientos/${pacienteId}`);
  return response.data.data;
};

export const getHistorialTratamientos = async (pacienteId: string): Promise<{
  tratamientos: Tratamiento[];
  estadisticas: {
    totalTratamientos: number;
    programados: number;
    enProceso: number;
    completados: number;
    cancelados: number;
    costoTotal: number;
    costoCompletados: number;
  };
}> => {
  const response = await axios.get(`/tratamientos/historial/${pacienteId}`);
  return response.data.data;
};

export const createTratamiento = async (tratamientoData: Omit<Tratamiento, '_id' | 'createdAt' | 'updatedAt'>): Promise<Tratamiento> => {
  console.log('🦷 Datos enviados para crear tratamiento:', tratamientoData);
  const response = await axios.post('/tratamientos', tratamientoData);
  return response.data.data;
};

export const updateTratamiento = async (id: string, tratamientoData: Partial<Tratamiento>): Promise<Tratamiento> => {
  const response = await axios.put(`/tratamientos/${id}`, tratamientoData);
  return response.data.data;
};

export const marcarTratamientoComoCompletado = async (id: string): Promise<Tratamiento> => {
  const response = await axios.put(`/tratamientos/${id}/marcar-completado`);
  return response.data.data;
};

export const deleteTratamiento = async (id: string): Promise<void> => {
  await axios.delete(`/tratamientos/${id}`);
};





