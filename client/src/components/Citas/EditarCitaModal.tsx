import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaCalendarAlt, FaClock, FaUser, FaSave } from 'react-icons/fa';
import { useMutation, useQueryClient } from 'react-query';
import { updateCita } from '../../services/citaService';
import { useNotification } from '../../hooks/useNotification';
import { Cita } from '../../types';

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

const PacienteInfo = styled.div`
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 20px;
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

// Función para obtener la fecha local en formato YYYY-MM-DD
const getLocalDateString = (date?: Date): string => {
  if (!date) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface EditarCitaModalProps {
  cita: Cita;
  onClose: () => void;
}

const EditarCitaModal: React.FC<EditarCitaModalProps> = ({ cita, onClose }) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    fecha: getLocalDateString(cita.fecha),
    hora: cita.hora || '09:00',
    motivo: cita.motivo || '',
    observaciones: cita.observaciones || '',
    tipoCita: cita.tipoCita || 'consulta' as const,
    costoEstimado: cita.costoEstimado || 0
  });

  useEffect(() => {
    setFormData({
      fecha: getLocalDateString(cita.fecha),
      hora: cita.hora || '09:00',
      motivo: cita.motivo || '',
      observaciones: cita.observaciones || '',
      tipoCita: cita.tipoCita || 'consulta',
      costoEstimado: cita.costoEstimado || 0
    });
  }, [cita]);

  const updateCitaMutation = useMutation(
    (data: any) => updateCita(cita._id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['citasDelDia']);
        showNotification('Cita actualizada exitosamente', 'success');
        onClose();
      },
      onError: (error: any) => {
        showNotification(`Error al actualizar cita: ${error.message || 'Error desconocido'}`, 'error');
      }
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Incluir el pacienteId de la cita original
    const pacienteId = typeof cita.pacienteId === 'object' ? cita.pacienteId._id : cita.pacienteId;
    updateCitaMutation.mutate({
      ...formData,
      pacienteId: pacienteId
    });
  };

  const paciente = typeof cita.pacienteId === 'object' ? cita.pacienteId : null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaCalendarAlt />
            Editar Cita
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <PacienteInfo>
            <Label>
              <FaUser /> Paciente
            </Label>
            <div style={{ marginTop: '8px', color: '#2c3e50' }}>
              <strong>{paciente?.nombre || 'Paciente no encontrado'}</strong>
              {paciente?.ci && <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>CI: {paciente.ci}</div>}
            </div>
          </PacienteInfo>

          <form onSubmit={handleSubmit}>
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
            disabled={updateCitaMutation.isLoading}
          >
            <FaSave />
            {updateCitaMutation.isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditarCitaModal;

