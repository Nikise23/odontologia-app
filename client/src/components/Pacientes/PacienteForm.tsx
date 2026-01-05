import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave } from 'react-icons/fa';
import { Paciente } from '../../types';
import { createPaciente, updatePaciente } from '../../services/pacienteService';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 0;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    width: 95%;
    max-height: 95vh;
    margin: 10px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #e74c3c;
  }
`;

const Form = styled.form`
  padding: 20px;
`;

const FormSection = styled.div`
  margin-bottom: 25px;
`;

const SectionTitle = styled.h3`
  color: #2c3e50;
  font-size: 16px;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #3498db;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 5px;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 10px;
  border: 1px solid ${props => props.$hasError ? '#e74c3c' : '#ddd'};
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

// const Select = styled.select<{ $hasError?: boolean }>`
//   padding: 10px;
//   border: 1px solid ${props => props.$hasError ? '#e74c3c' : '#ddd'};
//   border-radius: 4px;
//   font-size: 14px;
//   background-color: white;
//   
//   &:focus {
//     outline: none;
//     border-color: #3498db;
//   }
// `;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: 10px;
  border: 1px solid ${props => props.$hasError ? '#e74c3c' : '#ddd'};
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #2c3e50;
  cursor: pointer;
  
  input[type="checkbox"] {
    margin: 0;
  }
`;

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
`;

const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  
  ${props => props.$variant === 'primary' ? `
    background-color: #3498db;
    color: white;
    
    &:hover {
      background-color: #2980b9;
    }
  ` : `
    background-color: #95a5a6;
    color: white;
    
    &:hover {
      background-color: #7f8c8d;
    }
  `}
`;

interface PacienteFormProps {
  paciente?: Paciente | null;
  onClose: () => void;
  onSuccess: (paciente?: Paciente) => void;
}

// Función auxiliar para formatear fecha para input type="date"
const formatDateForInput = (date: Date | string | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  // Usar métodos UTC para evitar problemas de zona horaria
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const PacienteForm: React.FC<PacienteFormProps> = ({ paciente, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<Paciente>({
    defaultValues: {
      nombre: '',
      ci: '',
      alergias: 'Ninguna',
      edad: undefined,
      telefono: '',
      email: '',
      direccion: '',
      anamnesis: {
        diabetes: false,
        hipertension: false,
        cardiopatia: false,
        embarazo: false,
        medicamentos: 'Ninguno',
        antecedentesFamiliares: 'Ninguno',
        observacionesMedicas: ''
      }
    }
  });

  // Resetear el formulario cuando cambie el paciente
  useEffect(() => {
    if (paciente) {
      const formData: any = {
        nombre: paciente.nombre || '',
        ci: paciente.ci || '',
        alergias: paciente.alergias || 'Ninguna',
        edad: paciente.edad,
        telefono: paciente.telefono || '',
        email: paciente.email || '',
        direccion: paciente.direccion || '',
        fechaNacimiento: formatDateForInput(paciente.fechaNacimiento),
        anamnesis: {
          diabetes: paciente.anamnesis?.diabetes || false,
          hipertension: paciente.anamnesis?.hipertension || false,
          cardiopatia: paciente.anamnesis?.cardiopatia || false,
          embarazo: paciente.anamnesis?.embarazo || false,
          medicamentos: paciente.anamnesis?.medicamentos || 'Ninguno',
          antecedentesFamiliares: paciente.anamnesis?.antecedentesFamiliares || 'Ninguno',
          observacionesMedicas: paciente.anamnesis?.observacionesMedicas || ''
        }
      };
      reset(formData);
    } else {
      reset({
        nombre: '',
        ci: '',
        alergias: 'Ninguna',
        edad: undefined,
        telefono: '',
        email: '',
        direccion: '',
        fechaNacimiento: '',
        anamnesis: {
          diabetes: false,
          hipertension: false,
          cardiopatia: false,
          embarazo: false,
          medicamentos: 'Ninguno',
          antecedentesFamiliares: 'Ninguno',
          observacionesMedicas: ''
        }
      });
    }
  }, [paciente, reset]);

  const fechaNacimiento = watch('fechaNacimiento');

  useEffect(() => {
    if (fechaNacimiento && fechaNacimiento !== '') {
      const hoy = new Date();
      // Si viene como string YYYY-MM-DD, crear fecha en UTC para consistencia
      let nacimiento: Date;
      if (typeof fechaNacimiento === 'string' && fechaNacimiento.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = fechaNacimiento.split('-').map(Number);
        nacimiento = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      } else {
        nacimiento = new Date(fechaNacimiento);
      }
      
      // Calcular edad usando UTC para consistencia con el backend
      const hoyUTC = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
      const nacimientoUTC = new Date(Date.UTC(nacimiento.getUTCFullYear(), nacimiento.getUTCMonth(), nacimiento.getUTCDate()));
      let edad = hoyUTC.getUTCFullYear() - nacimientoUTC.getUTCFullYear();
      // Ajustar edad si aún no ha cumplido años
      const mesDiferencia = hoyUTC.getUTCMonth() - nacimientoUTC.getUTCMonth();
      if (mesDiferencia < 0 || (mesDiferencia === 0 && hoyUTC.getUTCDate() < nacimientoUTC.getUTCDate())) {
        edad--;
      }
      
      // Actualizar solo el campo edad
      setValue('edad', edad, { shouldDirty: false });
    }
  }, [fechaNacimiento, setValue]);

  const onSubmit = async (data: Paciente) => {
    setIsSubmitting(true);
    console.log('Datos a enviar:', data);
    try {
      if (paciente && paciente._id) {
        const response = await updatePaciente(paciente._id, data);
        alert('Paciente actualizado exitosamente');
        onSuccess(response.data);
      } else {
        const response = await createPaciente(data);
        alert('Paciente creado exitosamente');
        onSuccess(response.data);
      }
    } catch (error: any) {
      console.error('Error guardando paciente:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.join(', ') || 'Error al guardar el paciente';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {paciente ? 'Editar Paciente' : 'Nuevo Paciente'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormSection>
            <SectionTitle>Información Personal</SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Nombre Completo *</Label>
                <Input
                  {...register('nombre', { required: 'El nombre es obligatorio' })}
                  $hasError={!!errors.nombre}
                />
                {errors.nombre && <ErrorMessage>{errors.nombre.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Cédula de Identidad *</Label>
                <Input
                  {...register('ci', { required: 'La CI es obligatoria' })}
                  $hasError={!!errors.ci}
                />
                {errors.ci && <ErrorMessage>{errors.ci.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Fecha de Nacimiento</Label>
                <Input
                  type="date"
                  {...register('fechaNacimiento')}
                />
              </FormGroup>

              <FormGroup>
                <Label>Edad</Label>
                <Input
                  type="number"
                  {...register('edad', { min: 0, max: 120 })}
                  $hasError={!!errors.edad}
                />
                {errors.edad && <ErrorMessage>{errors.edad.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Teléfono</Label>
                <Input
                  {...register('telefono')}
                />
              </FormGroup>

              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  {...register('email')}
                  $hasError={!!errors.email}
                />
                {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Dirección</Label>
                <TextArea
                  {...register('direccion')}
                />
              </FormGroup>

              <FormGroup>
                <Label>Alergias</Label>
                <Input
                  {...register('alergias')}
                  placeholder="Ninguna"
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          <FormSection>
            <SectionTitle>Anamnesis</SectionTitle>
            <CheckboxGroup>
              <CheckboxItem>
                <input
                  type="checkbox"
                  {...register('anamnesis.diabetes')}
                />
                Diabetes
              </CheckboxItem>
              <CheckboxItem>
                <input
                  type="checkbox"
                  {...register('anamnesis.hipertension')}
                />
                Hipertensión
              </CheckboxItem>
              <CheckboxItem>
                <input
                  type="checkbox"
                  {...register('anamnesis.cardiopatia')}
                />
                Cardiopatía
              </CheckboxItem>
              <CheckboxItem>
                <input
                  type="checkbox"
                  {...register('anamnesis.embarazo')}
                />
                Embarazo
              </CheckboxItem>
            </CheckboxGroup>

            <FormGroup style={{ marginTop: '15px' }}>
              <Label>Medicamentos</Label>
              <Input
                {...register('anamnesis.medicamentos')}
                placeholder="Ninguno"
              />
            </FormGroup>

            <FormGroup>
              <Label>Antecedentes Familiares</Label>
              <Input
                {...register('anamnesis.antecedentesFamiliares')}
                placeholder="Ninguno"
              />
            </FormGroup>

            <FormGroup>
              <Label>Observaciones Médicas</Label>
              <TextArea
                {...register('anamnesis.observacionesMedicas')}
                placeholder="Observaciones adicionales..."
              />
            </FormGroup>
          </FormSection>

          <ButtonGroup>
            <Button type="button" $variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" $variant="primary" disabled={isSubmitting}>
              <FaSave />
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PacienteForm;
