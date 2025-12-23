import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaLock, FaTooth, FaShieldAlt, FaHeartbeat } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  padding: 20px;
  position: relative;
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 40px;
  color: white;
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const LogoIcon = styled.div`
  font-size: 64px;
  color: white;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
  animation: pulse 2s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  @media (max-width: 768px) {
    font-size: 48px;
  }
`;

const LogoText = styled.h1`
  margin: 0;
  color: white;
  font-size: 36px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const LogoSubtext = styled.p`
  margin: 10px 0 0 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 300;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
    max-width: 100%;
    border-radius: 16px;
  }
`;

const CardTitle = styled.h2`
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
`;

const CardSubtitle = styled.p`
  margin: 0 0 30px 0;
  color: #7f8c8d;
  font-size: 14px;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const InputContainer = styled.div`
  position: relative;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: #0055A4;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;

  &:hover {
    background: #0066CC;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 85, 164, 0.4);
  }

  &:active {
    transform: translateY(0);
    background: #004494;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    background: #0055A4;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  border-left: 4px solid #e74c3c;
`;

const Footer = styled.footer`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    padding: 15px;
    font-size: 12px;
  }
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const FooterItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    font-size: 16px;
  }
`;

const FooterLink = styled.a`
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: color 0.3s;
  
  &:hover {
    color: white;
    text-decoration: underline;
  }
`;

const Copyright = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 12px;
  opacity: 0.8;
`;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Después del login exitoso, el usuario se actualiza automáticamente
      // Redirigir a la página principal
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LogoSection>
        <LogoContainer>
          <LogoIcon>
            <FaTooth />
          </LogoIcon>
          <LogoText>Dental App</LogoText>
        </LogoContainer>
        <LogoSubtext>Sistema de Gestión Odontológica</LogoSubtext>
      </LogoSection>

      <LoginCard>
        <CardTitle>Bienvenido</CardTitle>
        <CardSubtitle>Inicia sesión para acceder al sistema</CardSubtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <InputContainer>
              <IconWrapper>
                <FaUser />
              </IconWrapper>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </InputContainer>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Contraseña</Label>
            <InputContainer>
              <IconWrapper>
                <FaLock />
              </IconWrapper>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </InputContainer>
          </FormGroup>

          <Button type="submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </LoginCard>

      <Footer>
        <FooterContent>
          <FooterItem>
            <FaShieldAlt />
            <span>Sistema Seguro</span>
          </FooterItem>
          <FooterItem>
            <FaHeartbeat />
            <span>Cuidado de tu Salud</span>
          </FooterItem>
        </FooterContent>
        <Copyright>
          © {new Date().getFullYear()} Dental App. Todos los derechos reservados.
          <br />
          Desarrollado por <strong>Nicolás Fernández</strong>
        </Copyright>
      </Footer>
    </LoginContainer>
  );
};

export default LoginPage;

