import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTooth, 
  FaUser, 
  FaClock, 
  FaPills, 
  FaBox, 
  FaCog, 
  FaSignOutAlt,
  FaChartLine,
  FaUsers
} from 'react-icons/fa';
import Notification from '../Notification/Notification';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.aside<{ $isOpen?: boolean }>`
  width: 250px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  z-index: 1000;
  
  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    width: 280px;
    z-index: 1000;
  }
`;

const Logo = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #34495e;
  
  .logo-icon {
    color: #3498db;
    font-size: 24px;
  }
  
  .logo-text {
    font-size: 18px;
    font-weight: bold;
  }
`;

const UserInfo = styled.div`
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #34495e;
  
  .user-icon {
    color: #3498db;
    font-size: 20px;
  }
  
  .user-text {
    font-size: 14px;
    color: #bdc3c7;
  }
`;

const Navigation = styled.nav`
  flex: 1;
  padding: 20px 0;
`;

const NavItem = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  color: ${props => props.$isActive ? '#3498db' : '#bdc3c7'};
  text-decoration: none;
  background-color: ${props => props.$isActive ? 'rgba(52, 152, 219, 0.1)' : 'transparent'};
  border-left: ${props => props.$isActive ? '3px solid #3498db' : '3px solid transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(52, 152, 219, 0.1);
    color: #3498db;
  }
  
  .nav-icon {
    font-size: 16px;
  }
  
  .nav-text {
    font-size: 14px;
    font-weight: 500;
  }
`;

const ExitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;
  
  &:hover {
    background-color: rgba(231, 76, 60, 0.1);
  }
  
  .exit-icon {
    font-size: 16px;
  }
  
  .exit-text {
    font-size: 14px;
    font-weight: 500;
  }
`;

const MainContent = styled.main`
  flex: 1;
  background-color: #ffffff;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MenuToggle = styled.button`
  display: none;
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1001;
  background: #2c3e50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { notification, hideNotification } = useNotification();
  const { usuario, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Definir items de navegación según el rol
  const getNavItems = () => {
    const rol = usuario?.rol || '';
    
    const items: Array<{ path: string; icon: any; text: string; permisos: string[] }> = [
      { path: '/usuarios', icon: FaUsers, text: 'USUARIOS', permisos: ['admin'] },
      { path: '/pacientes', icon: FaUser, text: 'PACIENTES', permisos: ['dentista', 'secretaria'] },
      { path: '/citas', icon: FaClock, text: 'CITAS', permisos: ['dentista', 'secretaria'] },
      { path: '/financiero', icon: FaChartLine, text: 'FINANCIERO', permisos: ['dentista', 'admin', 'secretaria'] },
      { path: '/medicamentos', icon: FaPills, text: 'MEDICAMENTOS', permisos: ['dentista', 'admin'] },
      { path: '/inventario', icon: FaBox, text: 'INVENTARIO', permisos: ['dentista', 'admin'] },
      { path: '/ajustes', icon: FaCog, text: 'AJUSTES', permisos: ['dentista', 'admin'] },
    ];
    
    // Filtrar items según permisos del usuario
    if (rol === 'admin') {
      // Admin puede ver todo
      return items;
    } else if (rol === 'dentista') {
      // Dentista puede ver todo excepto usuarios
      return items.filter(item => item.permisos.includes('dentista'));
    } else if (rol === 'secretaria') {
      // Secretaria solo puede ver pacientes y citas
      return items.filter(item => item.permisos.includes('secretaria'));
    } else if (rol === 'paciente') {
      // Paciente tiene acceso limitado
      return [];
    }
    
    return items; // Por defecto mostrar todo (para desarrollo)
  };

  const navItems = getNavItems();

  return (
    <LayoutContainer>
      <MenuToggle onClick={toggleSidebar}>
        ☰
      </MenuToggle>
      <Overlay $isOpen={sidebarOpen} onClick={closeSidebar} />
      <Sidebar $isOpen={sidebarOpen}>
        <Logo>
          <FaTooth className="logo-icon" />
          <span className="logo-text">Dental App</span>
        </Logo>
        
        <UserInfo>
          <FaUser className="user-icon" />
          <span className="user-text">
            {usuario ? `${usuario.nombre} - ${usuario.rol.toUpperCase()}` : 'Usuario'}
          </span>
        </UserInfo>
        
        <Navigation>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <NavItem 
                key={item.path} 
                to={item.path} 
                $isActive={isActive}
                onClick={closeSidebar}
              >
                <Icon className="nav-icon" />
                <span className="nav-text">{item.text}</span>
              </NavItem>
            );
          })}
        </Navigation>
        
        <ExitButton onClick={handleLogout}>
          <FaSignOutAlt className="exit-icon" />
          <span className="exit-text">SALIR</span>
        </ExitButton>
      </Sidebar>
      
      <MainContent>
        {children}
      </MainContent>
      
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
    </LayoutContainer>
  );
};

export default Layout;
