import axios from './axiosConfig';
import { ApiResponse } from '../types';

export interface Usuario {
  _id?: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'dentista' | 'secretaria' | 'paciente';
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const getUsuarios = async (): Promise<ApiResponse<Usuario[]>> => {
  const response = await axios.get('/usuarios');
  return response.data;
};

export const getUsuario = async (id: string): Promise<ApiResponse<Usuario>> => {
  const response = await axios.get(`/usuarios/${id}`);
  return response.data;
};

export const createUsuario = async (usuarioData: {
  nombre: string;
  email: string;
  password: string;
  rol: 'dentista' | 'secretaria';
  activo?: boolean;
}): Promise<ApiResponse<Usuario>> => {
  const response = await axios.post('/usuarios', usuarioData);
  return response.data;
};

export const updateUsuario = async (id: string, usuarioData: Partial<{
  nombre: string;
  email: string;
  password: string;
  rol: 'dentista' | 'secretaria';
  activo: boolean;
}>): Promise<ApiResponse<Usuario>> => {
  const response = await axios.put(`/usuarios/${id}`, usuarioData);
  return response.data;
};

export const deleteUsuario = async (id: string): Promise<ApiResponse<void>> => {
  const response = await axios.delete(`/usuarios/${id}`);
  return response.data;
};
