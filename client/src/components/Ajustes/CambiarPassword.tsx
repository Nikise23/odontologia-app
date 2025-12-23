import React, { useState } from 'react';
import styled from 'styled-components';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { cambiarPassword } from '../../services/authService';
import { useNotification } from '../../hooks/useNotification';

const Container = styled.div`
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Title = styled.h2`
  color: #2c3e50;
  font-size: 24px;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 14px;
  margin: 0 0 25px 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
  
  &.error {
    border-color: #e74c3c;
  }
  
  &.success {
    border-color: #2ecc71;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #2c3e50;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 12px;
  margin-top: -5px;
`;

const SuccessMessage = styled.div`
  color: #2ecc71;
  font-size: 12px;
  margin-top: -5px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Button = styled.button`
  padding: 14px 24px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }
  
  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
    transform: none;
  }
`;

const PasswordStrength = styled.div`
  margin-top: 5px;
  font-size: 12px;
`;

const StrengthBar = styled.div<{ $strength: number }>`
  height: 4px;
  background: ${props => {
    if (props.$strength === 0) return '#e0e0e0';
    if (props.$strength <= 2) return '#e74c3c';
    if (props.$strength <= 3) return '#f39c12';
    return '#2ecc71';
  }};
  border-radius: 2px;
  width: ${props => (props.$strength / 4) * 100}%;
  transition: all 0.3s ease;
`;

const StrengthText = styled.span<{ $strength: number }>`
  color: ${props => {
    if (props.$strength === 0) return '#7f8c8d';
    if (props.$strength <= 2) return '#e74c3c';
    if (props.$strength <= 3) return '#f39c12';
    return '#2ecc71';
  }};
  font-weight: 500;
`;

const CambiarPassword: React.FC = () => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    passwordActual: '',
    passwordNuevo: '',
    confirmarPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    passwordActual: false,
    passwordNuevo: false,
    confirmarPassword: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const getStrengthText = (strength: number): string => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Débil';
    if (strength <= 3) return 'Media';
    return 'Fuerte';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.passwordActual) {
      newErrors.passwordActual = 'La contraseña actual es requerida';
    }

    if (!formData.passwordNuevo) {
      newErrors.passwordNuevo = 'La nueva contraseña es requerida';
    } else if (formData.passwordNuevo.length < 6) {
      newErrors.passwordNuevo = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmarPassword) {
      newErrors.confirmarPassword = 'Confirma la nueva contraseña';
    } else if (formData.passwordNuevo !== formData.confirmarPassword) {
      newErrors.confirmarPassword = 'Las contraseñas no coinciden';
    }

    if (formData.passwordActual && formData.passwordNuevo && formData.passwordActual === formData.passwordNuevo) {
      newErrors.passwordNuevo = 'La nueva contraseña debe ser diferente a la actual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await cambiarPassword(formData);
      setSuccess(true);
      setFormData({
        passwordActual: '',
        passwordNuevo: '',
        confirmarPassword: ''
      });
      showNotification('Contraseña actualizada exitosamente', 'success');
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar contraseña';
      const errorDetails = error.response?.data?.errors || [];
      
      if (errorDetails.length > 0) {
        const newErrors: Record<string, string> = {};
        errorDetails.forEach((err: string) => {
          if (err.includes('actual')) newErrors.passwordActual = err;
          if (err.includes('nuevo') || err.includes('nueva')) newErrors.passwordNuevo = err;
          if (err.includes('coinciden')) newErrors.confirmarPassword = err;
        });
        setErrors(newErrors);
      } else {
        showNotification(errorMessage, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(formData.passwordNuevo);

  return (
    <Container>
      <Title>
        <FaLock /> Cambiar Contraseña
      </Title>
      <Subtitle>
        Actualiza tu contraseña para mantener tu cuenta segura. Usa una contraseña fuerte y única.
      </Subtitle>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Contraseña Actual</Label>
          <InputContainer>
            <Input
              type={showPasswords.passwordActual ? 'text' : 'password'}
              value={formData.passwordActual}
              onChange={(e) => {
                setFormData({ ...formData, passwordActual: e.target.value });
                if (errors.passwordActual) {
                  setErrors({ ...errors, passwordActual: '' });
                }
              }}
              className={errors.passwordActual ? 'error' : ''}
              placeholder="Ingresa tu contraseña actual"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, passwordActual: !showPasswords.passwordActual })}
            >
              {showPasswords.passwordActual ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
          </InputContainer>
          {errors.passwordActual && <ErrorMessage>{errors.passwordActual}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Nueva Contraseña</Label>
          <InputContainer>
            <Input
              type={showPasswords.passwordNuevo ? 'text' : 'password'}
              value={formData.passwordNuevo}
              onChange={(e) => {
                setFormData({ ...formData, passwordNuevo: e.target.value });
                if (errors.passwordNuevo) {
                  setErrors({ ...errors, passwordNuevo: '' });
                }
              }}
              className={errors.passwordNuevo ? 'error' : passwordStrength >= 3 ? 'success' : ''}
              placeholder="Mínimo 6 caracteres"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, passwordNuevo: !showPasswords.passwordNuevo })}
            >
              {showPasswords.passwordNuevo ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
          </InputContainer>
          {formData.passwordNuevo && (
            <PasswordStrength>
              <StrengthBar $strength={passwordStrength} />
              {passwordStrength > 0 && (
                <StrengthText $strength={passwordStrength}>
                  {getStrengthText(passwordStrength)}
                </StrengthText>
              )}
            </PasswordStrength>
          )}
          {errors.passwordNuevo && <ErrorMessage>{errors.passwordNuevo}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Confirmar Nueva Contraseña</Label>
          <InputContainer>
            <Input
              type={showPasswords.confirmarPassword ? 'text' : 'password'}
              value={formData.confirmarPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmarPassword: e.target.value });
                if (errors.confirmarPassword) {
                  setErrors({ ...errors, confirmarPassword: '' });
                }
              }}
              className={
                errors.confirmarPassword
                  ? 'error'
                  : formData.confirmarPassword && formData.passwordNuevo === formData.confirmarPassword
                  ? 'success'
                  : ''
              }
              placeholder="Confirma tu nueva contraseña"
            />
            <PasswordToggle
              type="button"
              onClick={() =>
                setShowPasswords({ ...showPasswords, confirmarPassword: !showPasswords.confirmarPassword })
              }
            >
              {showPasswords.confirmarPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
          </InputContainer>
          {formData.confirmarPassword &&
            formData.passwordNuevo === formData.confirmarPassword &&
            !errors.confirmarPassword && (
              <SuccessMessage>
                <FaCheckCircle /> Las contraseñas coinciden
              </SuccessMessage>
            )}
          {errors.confirmarPassword && <ErrorMessage>{errors.confirmarPassword}</ErrorMessage>}
        </FormGroup>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
        </Button>
      </Form>
    </Container>
  );
};

export default CambiarPassword;

