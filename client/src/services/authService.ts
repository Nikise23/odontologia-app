import axios from './axiosConfig';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'dentista' | 'secretaria' | 'paciente';
  pacienteId?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    usuario: Usuario;
  };
}

export interface AuthResponse {
  success: boolean;
  data?: Usuario;
  message?: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axios.post('/auth/login', { email, password });
  return response.data;
};

export const verificarToken = async (): Promise<AuthResponse> => {
  const token = localStorage.getItem('token');
  if (!token) {
    return { success: false, message: 'No hay token' };
  }

  try {
    const response = await axios.get('/auth/verificar', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    localStorage.removeItem('token');
    return { success: false, message: 'Token inválido' };
  }
};

export const registro = async (datos: {
  nombre: string;
  email: string;
  password: string;
  rol: 'admin' | 'dentista' | 'secretaria' | 'paciente';
  pacienteId?: string;
}): Promise<LoginResponse> => {
  const response = await axios.post('/auth/registro', datos);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

export interface CambiarPasswordData {
  passwordActual: string;
  passwordNuevo: string;
  confirmarPassword: string;
}

export interface CambiarPasswordResponse {
  success: boolean;
  message: string;
  errors?: string[];
}

export const cambiarPassword = async (datos: CambiarPasswordData): Promise<CambiarPasswordResponse> => {
  const response = await axios.put('/auth/cambiar-password', datos);
  return response.data;
};




