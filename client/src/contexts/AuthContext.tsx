import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as loginService, verificarToken, logout as logoutService, Usuario } from '../services/authService';
import { useNotification } from '../hooks/useNotification';

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verificarPermiso: (accion: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();

  // Verificar token al cargar
  useEffect(() => {
    const verificarAuth = async () => {
      const token = localStorage.getItem('token');
      const usuarioGuardado = localStorage.getItem('usuario');
      
      if (token && usuarioGuardado) {
        try {
          // Intentar verificar token
          const response = await verificarToken();
          if (response.success && response.data) {
            setUsuario(response.data);
          } else {
            // Token inválido, limpiar
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
        }
      }
      
      setIsLoading(false);
    };

    verificarAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginService(email, password);
      
      if (response.success && response.data) {
        const { token, usuario } = response.data;
        
        // Guardar token y usuario
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        
        // Configurar token en axios (ya se configura automáticamente en el interceptor)
        // Pero podemos asegurarnos aquí también
        const axios = (await import('../services/axiosConfig')).default;
        if (axios.defaults.headers) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        setUsuario(usuario);
        showNotification(`¡Bienvenido ${usuario.nombre}!`, 'success');
      } else {
        throw new Error(response.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      const mensaje = error.response?.data?.message || 'Error al iniciar sesión';
      showNotification(mensaje, 'error');
      throw error;
    }
  };

  const logout = () => {
    logoutService();
    setUsuario(null);
    delete (window as any).axios?.defaults?.headers?.common['Authorization'];
    showNotification('Sesión cerrada', 'info');
  };

  const verificarPermiso = (accion: string): boolean => {
    if (!usuario) return false;

    // Matriz de permisos
    const permisos: Record<string, string[]> = {
      admin: ['*'], // Acceso total
      dentista: ['*'], // Acceso total
      secretaria: [
        'ver-citas', 'crear-citas', 'editar-citas', 'cancelar-citas',
        'ver-pagos', 'crear-pagos', 'editar-pagos', 'eliminar-pagos',
        'ver-pacientes', 'crear-pacientes', 'editar-pacientes',
        'ver-consultas', 'ver-tratamientos', 'ver-odontograma'
      ],
      paciente: [
        'ver-propias-citas',
        'ver-propios-datos',
        'ver-propios-pagos',
        'ver-propio-odontograma'
      ]
    };

    const permisosUsuario = permisos[usuario.rol] || [];
    
    // Si tiene acceso total o la acción específica
    return permisosUsuario.includes('*') || permisosUsuario.includes(accion);
  };

  const value: AuthContextType = {
    usuario,
    isAuthenticated: !!usuario,
    isLoading,
    login,
    logout,
    verificarPermiso
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

