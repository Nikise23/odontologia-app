import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaCalendarAlt, FaClock, FaUser, FaSave, FaPlus } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { createCita } from '../../services/citaService';
import { getPacientes } from '../../services/pacienteService';
import { useNotification } from '../../hooks/useNotification';
import PacienteForm from '../Pacientes/PacienteForm';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    color: #dc3545;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const PacienteSearch = styled.div`
  position: relative;
`;

const PacienteList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-top: none;
  border-radius: 0 0 6px 6px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
`;

const PacienteItem = styled.div`
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const PacienteNombre = styled.div`
  font-weight: 600;
  color: #2c3e50;
`;

const PacienteCI = styled.div`
  font-size: 12px;
  color: #6c757d;
`;

const ModalFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  
  ${props => props.$variant === 'primary' ? `
    background: #007bff;
    color: white;
    &:hover { background: #0056b3; }
    &:disabled { background: #6c757d; cursor: not-allowed; }
  ` : `
    background: #6c757d;
    color: white;
    &:hover { background: #545b62; }
  `}
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #6c757d;
`;

const CreatePacienteButton = styled.button`
  margin-top: 10px;
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: center;
  
  &:hover {
    background: #218838;
  }
`;

// Función para obtener la fecha local en formato YYYY-MM-DD
const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface NuevaCitaModalProps {
  onClose: () => void;
}

const NuevaCitaModal: React.FC<NuevaCitaModalProps> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    pacienteId: '',
    fecha: getLocalDateString(),
    hora: '09:00',
    motivo: '',
    observaciones: '',
    tipoCita: 'consulta' as const,
    costoEstimado: 0
  });
  
  const [pacienteSearch, setPacienteSearch] = useState('');
  const [mostrarListaPacientes, setMostrarListaPacientes] = useState(false);
  const [mostrarFormPaciente, setMostrarFormPaciente] = useState(false);

  const { data: pacientesData, isLoading: cargandoPacientes } = useQuery(
    ['pacientes', pacienteSearch],
    () => getPacientes(1, 10, pacienteSearch),
    {
      enabled: pacienteSearch.length > 2,
    }
  );

  const createCitaMutation = useMutation(createCita, {
    onSuccess: () => {
      queryClient.invalidateQueries(['citasDelDia']);
      showNotification('Cita creada exitosamente', 'success');
      onClose();
    },
    onError: (error: any) => {
      showNotification(`Error al crear cita: ${error.message || 'Error desconocido'}`, 'error');
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePacienteSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPacienteSearch(value);
    setMostrarListaPacientes(value.length > 2);
    
    if (!value) {
      setFormData(prev => ({ ...prev, pacienteId: '' }));
    }
  };

  const handlePacienteSelect = (paciente: any) => {
    setPacienteSearch(`${paciente.nombre} - ${paciente.ci}`);
    setFormData(prev => ({ ...prev, pacienteId: paciente._id }));
    setMostrarListaPacientes(false);
  };

  const handlePacienteCreated = (paciente: any) => {
    setPacienteSearch(`${paciente.nombre} - ${paciente.ci}`);
    setFormData(prev => ({ ...prev, pacienteId: paciente._id }));
    setMostrarFormPaciente(false);
    queryClient.invalidateQueries(['pacientes']);
    showNotification('Paciente creado exitosamente', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pacienteId) {
      showNotification('Debe seleccionar un paciente', 'error');
      return;
    }
    
    createCitaMutation.mutate(formData);
  };

  const pacientes = pacientesData?.data || [];

  if (mostrarFormPaciente) {
    return (
      <PacienteForm
        paciente={null}
        onClose={() => setMostrarFormPaciente(false)}
        onSuccess={(pacienteCreado) => {
          if (pacienteCreado) {
            handlePacienteCreated(pacienteCreado);
          } else {
            setMostrarFormPaciente(false);
          }
        }}
      />
    );
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaCalendarAlt />
            Nueva Cita
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>
                <FaUser /> Paciente
              </Label>
              <PacienteSearch>
                <Input
                  type="text"
                  placeholder="Buscar paciente por nombre o CI..."
                  value={pacienteSearch}
                  onChange={handlePacienteSearch}
                  required
                />
                {mostrarListaPacientes && (
                  <PacienteList>
                    {cargandoPacientes ? (
                      <LoadingMessage>Cargando...</LoadingMessage>
                    ) : pacientes.length > 0 ? (
                      pacientes.map((paciente: any) => (
                        <PacienteItem
                          key={paciente._id}
                          onClick={() => handlePacienteSelect(paciente)}
                        >
                          <PacienteNombre>{paciente.nombre}</PacienteNombre>
                          <PacienteCI>CI: {paciente.ci}</PacienteCI>
                        </PacienteItem>
                      ))
                    ) : (
                      <PacienteItem>No se encontraron pacientes</PacienteItem>
                    )}
                  </PacienteList>
                )}
                {pacienteSearch.length > 2 && !mostrarListaPacientes && pacientes.length === 0 && !cargandoPacientes && (
                  <CreatePacienteButton
                    type="button"
                    onClick={() => setMostrarFormPaciente(true)}
                  >
                    <FaPlus />
                    Crear nuevo paciente
                  </CreatePacienteButton>
                )}
                {pacienteSearch.length === 0 && (
                  <CreatePacienteButton
                    type="button"
                    onClick={() => setMostrarFormPaciente(true)}
                    style={{ marginTop: '10px' }}
                  >
                    <FaPlus />
                    Crear nuevo paciente
                  </CreatePacienteButton>
                )}
              </PacienteSearch>
            </FormGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <FormGroup>
                <Label>
                  <FaCalendarAlt /> Fecha
                </Label>
                <Input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FaClock /> Hora
                </Label>
                <Input
                  type="time"
                  name="hora"
                  value={formData.hora}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
            </div>

            <FormGroup>
              <Label>Tipo de Cita</Label>
              <Select
                name="tipoCita"
                value={formData.tipoCita}
                onChange={handleInputChange}
              >
                <option value="consulta">Consulta</option>
                <option value="tratamiento">Tratamiento</option>
                <option value="revision">Revisión</option>
                <option value="urgencia">Urgencia</option>
                <option value="limpieza">Limpieza</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Motivo de la Cita</Label>
              <TextArea
                name="motivo"
                value={formData.motivo}
                onChange={handleInputChange}
                placeholder="Describe el motivo de la cita..."
              />
            </FormGroup>

            <FormGroup>
              <Label>Costo Estimado</Label>
              <Input
                type="number"
                name="costoEstimado"
                value={formData.costoEstimado}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
            </FormGroup>

            <FormGroup>
              <Label>Observaciones</Label>
              <TextArea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                placeholder="Observaciones adicionales..."
              />
            </FormGroup>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button $variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            $variant="primary"
            onClick={handleSubmit}
            disabled={createCitaMutation.isLoading}
          >
            <FaSave />
            {createCitaMutation.isLoading ? 'Guardando...' : 'Guardar Cita'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default NuevaCitaModal;
